import { useState, useEffect } from "react";
import { AudioSection, TimelineSection, VideoSnapshot } from "../../components/preview/timeline/timeline";

const SNAP_THRESHOLD = 0.5;
const EDGE_SNAP_THRESHOLD = 0.1;

export function useSnapLogic(
  sections: TimelineSection[],
  audioSections: AudioSection[],
  snapshots: VideoSnapshot[] | undefined,
  duration: number
) {
  const [snappingPoints, setSnappingPoints] = useState<number[]>([]);
  const [activeSnapPoint, setActiveSnapPoint] = useState<number | null>(null);

  useEffect(() => {
    const points: number[] = [];

    if (snapshots) {
      snapshots.forEach((snapshot) => {
        points.push(snapshot.time);
      });
    }

    sections.forEach(section => {
      points.push(section.startTime);
      points.push(section.endTime);
    });

    audioSections.forEach(section => {
      points.push(section.startTime);
      points.push(section.endTime);
    });

    points.push(0);
    if (duration > 0) {
      points.push(duration);
    }

    const uniquePoints = [...new Set(points)].sort((a, b) => a - b);
    setSnappingPoints(uniquePoints);
  }, [sections, audioSections, snapshots, duration]);

  const findNearestSnapPoint = (
    time: number,
    excludePoints: number[] = [],
    prioritizeSections: boolean = false
  ): number => {
    if (snappingPoints.length === 0) return time;

    let closest = time;
    let minDistance = SNAP_THRESHOLD + 0.1; // Initialize with value greater than threshold

    if (prioritizeSections) {
      const sectionBoundaries = sections.flatMap(section => [section.startTime, section.endTime]);

      for (const point of sectionBoundaries) {
        if (excludePoints.includes(point)) continue;

        const distance = Math.abs(time - point);
        if (distance < EDGE_SNAP_THRESHOLD) {
          setActiveSnapPoint(point);
          return point;
        }
      }
    }

    for (const point of snappingPoints) {
      if (excludePoints.includes(point)) continue;

      const distance = Math.abs(time - point);
      if (distance < minDistance) {
        minDistance = distance;
        closest = point;
      }
    }

    if (minDistance <= SNAP_THRESHOLD) {
      setActiveSnapPoint(closest);
      return closest;
    } else {
      setActiveSnapPoint(null);
      return time;
    }
  };

  const clearSnapPoint = () => setActiveSnapPoint(null);

  return {
    snappingPoints,
    activeSnapPoint,
    findNearestSnapPoint,
    clearSnapPoint
  };
}
