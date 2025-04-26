import { useState, useRef } from "react";
import { TimelineSection, AudioSection, VideoSnapshot } from "../../components/preview/timeline/types";
import { useSnapLogic } from "@/hooks/timeline-hooks/use-snap-logic";

export function useDragLogic(
  sections: TimelineSection[],
  setSections: React.Dispatch<React.SetStateAction<TimelineSection[]>>,
  audioSections: AudioSection[],
  setAudioSections: React.Dispatch<React.SetStateAction<AudioSection[]>>,
  duration: number,
  snapshots: VideoSnapshot[] | undefined | null,
  getTimeFromMousePosition: (clientX: number) => number,
  onSectionMove?: (sectionId: string, oldStartTime: number, oldEndTime: number, newStartTime: number, newEndTime: number) => void
) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isDraggingSection, setIsDraggingSection] = useState(false);
  const [currentDragSection, setCurrentDragSection] = useState<TimelineSection | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const originalSectionRef = useRef<{startTime: number, endTime: number} | null>(null);

  const { findNearestSnapPoint, clearSnapPoint } = useSnapLogic(
    sections,
    audioSections,
    snapshots || undefined,
    duration
  );

  const handleDragStart = (
    event: React.MouseEvent | React.TouchEvent,
    sectionId: string
  ) => {
    event.preventDefault();

    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    originalSectionRef.current = {
      startTime: section.startTime,
      endTime: section.endTime
    };

    const clientX = 'touches' in event
      ? event.touches[0].clientX
      : event.clientX;

    const clickTime = getTimeFromMousePosition(clientX);
    const offset = clickTime - section.startTime;

    setActiveDragId(sectionId);
    setIsDraggingSection(true);
    setCurrentDragSection(section);
    setDragOffset(offset);

    const excludePoints = [section.startTime, section.endTime];

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e
        ? e.touches[0].clientX
        : e.clientX;

      const currentTime = getTimeFromMousePosition(clientX);
      const sectionDuration = section.endTime - section.startTime;

      let newStartTime = currentTime - offset;

      if (newStartTime < 0) {
        newStartTime = 0;
      } else if (newStartTime + sectionDuration > duration) {
        newStartTime = duration - sectionDuration;
      }

      const snappedStartTime = findNearestSnapPoint(newStartTime, excludePoints);
      const snappedEndTime = snappedStartTime + sectionDuration;

      setSections(prevSections =>
        prevSections.map(s =>
          s.id === sectionId
            ? {
                ...s,
                startTime: snappedStartTime,
                endTime: snappedEndTime
              }
            : s
        )
      );

      if (section.isLinkedToAudio && section.linkedAudioId) {
        setAudioSections(prevAudioSections =>
          prevAudioSections.map(as =>
            as.id === section.linkedAudioId
              ? {
                  ...as,
                  startTime: snappedStartTime,
                  endTime: snappedEndTime
                }
              : as
          )
        );
      }
    };

    const handleDragEnd = () => {
      if (onSectionMove && originalSectionRef.current) {
        const currentSection = sections.find(s => s.id === sectionId);
        if (currentSection) {
          onSectionMove(
            sectionId,
            originalSectionRef.current.startTime,
            originalSectionRef.current.endTime,
            currentSection.startTime,
            currentSection.endTime
          );
        }
      }

      setActiveDragId(null);
      setIsDraggingSection(false);
      setCurrentDragSection(null);
      originalSectionRef.current = null;
      clearSnapPoint();

      document.removeEventListener('mousemove', handleDragMove as any);
      document.removeEventListener('touchmove', handleDragMove as any);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDragMove as any);
    document.addEventListener('touchmove', handleDragMove as any);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
  };

  return {
    activeDragId,
    isDraggingSection,
    currentDragSection,
    handleDragStart
  };
}
