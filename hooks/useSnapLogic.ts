import { useState, useEffect } from "react";
import { AudioSection, TimelineSection, VideoSnapshot } from "../lib/types/timeline";

// Configuration for snapping
const SNAP_THRESHOLD = 0.5; // in seconds
const EDGE_SNAP_THRESHOLD = 0.1; // tighter threshold for section edges

export function useSnapLogic(
  sections: TimelineSection[],
  audioSections: AudioSection[],
  snapshots: VideoSnapshot[] | undefined,
  duration: number
) {
  const [snappingPoints, setSnappingPoints] = useState<number[]>([]);
  const [activeSnapPoint, setActiveSnapPoint] = useState<number | null>(null);

  // Calculate all possible snapping points
  useEffect(() => {
    const points: number[] = [];

    // Add snapshot times as potential snap points
    if (snapshots) {
      snapshots.forEach((snapshot) => {
        points.push(snapshot.time);
      });
    }

    // Add video section boundaries as potential snap points
    sections.forEach(section => {
      points.push(section.startTime);
      points.push(section.endTime);
    });

    // Add audio section boundaries as potential snap points
    audioSections.forEach(section => {
      points.push(section.startTime);
      points.push(section.endTime);
    });

    // Add start and end of timeline
    points.push(0);
    if (duration > 0) {
      points.push(duration);
    }

    // Remove duplicates and sort
    const uniquePoints = [...new Set(points)].sort((a, b) => a - b);
    setSnappingPoints(uniquePoints);
  }, [sections, audioSections, snapshots, duration]);

  // Find the nearest snap point to a given time
  const findNearestSnapPoint = (
    time: number,
    excludePoints: number[] = [],
    prioritizeSections: boolean = false
  ): number => {
    if (snappingPoints.length === 0) return time;

    let closest = time;
    let minDistance = SNAP_THRESHOLD + 0.1; // Initialize with value greater than threshold

    // First pass: check for section boundaries if prioritizing sections
    if (prioritizeSections) {
      // Get all section start and end times
      const sectionBoundaries = sections.flatMap(section => [section.startTime, section.endTime]);

      for (const point of sectionBoundaries) {
        // Skip excluded points
        if (excludePoints.includes(point)) continue;

        const distance = Math.abs(time - point);
        if (distance < EDGE_SNAP_THRESHOLD) {
          // Immediately return on section boundary match with tight threshold
          setActiveSnapPoint(point);
          return point;
        }
      }
    }

    // Second pass: check all snapping points
    for (const point of snappingPoints) {
      // Skip excluded points
      if (excludePoints.includes(point)) continue;

      const distance = Math.abs(time - point);
      if (distance < minDistance) {
        minDistance = distance;
        closest = point;
      }
    }

    // Only set active snap point if we actually snapped
    if (minDistance <= SNAP_THRESHOLD) {
      setActiveSnapPoint(closest);
      return closest;
    } else {
      setActiveSnapPoint(null);
      return time;
    }
  };

  // Clear the active snap point
  const clearSnapPoint = () => setActiveSnapPoint(null);

  return {
    snappingPoints,
    activeSnapPoint,
    findNearestSnapPoint,
    clearSnapPoint
  };
}
