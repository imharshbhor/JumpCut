import { useState, useRef } from "react";
import { TimelineSection, AudioSection, VideoSnapshot } from "../lib/types/timeline";
import { useSnapLogic } from "@/hooks/useSnapLogic";

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

  // Integrate with snap logic
  const { findNearestSnapPoint, clearSnapPoint } = useSnapLogic(
    sections,
    audioSections,
    snapshots || undefined,
    duration
  );

  // Handle drag start
  const handleDragStart = (
    event: React.MouseEvent | React.TouchEvent,
    sectionId: string
  ) => {
    // Prevent default to avoid browser's default drag behavior
    event.preventDefault();

    // Find the section being dragged
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    // Store original start and end times for later reference
    originalSectionRef.current = {
      startTime: section.startTime,
      endTime: section.endTime
    };

    // Calculate drag offset based on where the user clicked within the section
    const clientX = 'touches' in event
      ? event.touches[0].clientX
      : event.clientX;

    const clickTime = getTimeFromMousePosition(clientX);
    const offset = clickTime - section.startTime;

    // Set dragging state
    setActiveDragId(sectionId);
    setIsDraggingSection(true);
    setCurrentDragSection(section);
    setDragOffset(offset);

    // Exclude the current section's boundaries from snapping
    // to prevent snapping to itself during drag
    const excludePoints = [section.startTime, section.endTime];

    // Setup event handlers for drag move and drag end
    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e
        ? e.touches[0].clientX
        : e.clientX;

      const currentTime = getTimeFromMousePosition(clientX);
      const sectionDuration = section.endTime - section.startTime;

      // Calculate new start position considering the drag offset
      let newStartTime = currentTime - offset;

      // Ensure we don't drag beyond timeline bounds
      if (newStartTime < 0) {
        newStartTime = 0;
      } else if (newStartTime + sectionDuration > duration) {
        newStartTime = duration - sectionDuration;
      }

      // Find the nearest snap point if any
      const snappedStartTime = findNearestSnapPoint(newStartTime, excludePoints);
      const snappedEndTime = snappedStartTime + sectionDuration;

      // Update the sections with new positions
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

      // If there's a linked audio section, update it too
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
      // Call the section move callback if it exists
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

      // Clear dragging state
      setActiveDragId(null);
      setIsDraggingSection(false);
      setCurrentDragSection(null);
      originalSectionRef.current = null;
      clearSnapPoint();

      // Remove event listeners
      document.removeEventListener('mousemove', handleDragMove as any);
      document.removeEventListener('touchmove', handleDragMove as any);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };

    // Add event listeners for drag move and drag end
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
