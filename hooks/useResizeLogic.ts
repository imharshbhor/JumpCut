import { useState } from "react";
import { TimelineSection, AudioSection } from "../lib/types/timeline";
import { useSnapLogic } from "./useSnapLogic";

export function useResizeLogic(
  sections: TimelineSection[],
  setSections: React.Dispatch<React.SetStateAction<TimelineSection[]>>,
  audioSections: AudioSection[],
  setAudioSections: React.Dispatch<React.SetStateAction<AudioSection[]>>,
  duration: number,
  snapshots: any,
  getTimeFromMousePosition: (clientX: number) => number
) {
  const [isResizingSection, setIsResizingSection] = useState(false);
  const [resizeSide, setResizeSide] = useState<'left' | 'right' | null>(null);
  const [resizeSection, setResizeSection] = useState<TimelineSection | null>(null);

  // Integrate with snap logic
  const { findNearestSnapPoint, clearSnapPoint } = useSnapLogic(
    sections,
    audioSections,
    snapshots,
    duration
  );

  // Start the resize operation
  const handleSectionResizeStart = (
    e: React.MouseEvent,
    sectionId: string,
    side: 'left' | 'right'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setIsResizingSection(true);
    setResizeSide(side);
    setResizeSection(section);

    // Set up handlers for mouse move and mouse up
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeSection) return;

      const mouseTime = getTimeFromMousePosition(e.clientX);

      // Determine exclude points to avoid snapping to the opposite edge
      const excludePoints = side === 'left'
        ? [resizeSection.endTime]
        : [resizeSection.startTime];

      // Make sure we don't resize beyond valid bounds
      let newTime;
      if (side === 'left') {
        // Ensure new start time is not after end time or less than 0
        newTime = Math.min(Math.max(mouseTime, 0), resizeSection.endTime - 0.5);
      } else {
        // Ensure new end time is not before start time or greater than duration
        newTime = Math.max(Math.min(mouseTime, duration), resizeSection.startTime + 0.5);
      }

      // Find nearest snap point if any
      const snappedTime = findNearestSnapPoint(newTime, excludePoints, true);

      // Update the section with new start or end time
      setSections(prevSections =>
        prevSections.map(s => {
          if (s.id === resizeSection.id) {
            return {
              ...s,
              startTime: side === 'left' ? snappedTime : s.startTime,
              endTime: side === 'right' ? snappedTime : s.endTime
            };
          }
          return s;
        })
      );

      // If there's a linked audio section, update it too
      if (resizeSection.isLinkedToAudio && resizeSection.linkedAudioId) {
        setAudioSections(prevAudioSections =>
          prevAudioSections.map(as => {
            if (as.id === resizeSection.linkedAudioId) {
              return {
                ...as,
                startTime: side === 'left' ? snappedTime : as.startTime,
                endTime: side === 'right' ? snappedTime : as.endTime
              };
            }
            return as;
          })
        );
      }
    };

    const handleMouseUp = () => {
      // Clear resize state
      setIsResizingSection(false);
      setResizeSide(null);
      setResizeSection(null);
      clearSnapPoint();

      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return {
    isResizingSection,
    resizeSide,
    resizeSection,
    handleSectionResizeStart
  };
}
