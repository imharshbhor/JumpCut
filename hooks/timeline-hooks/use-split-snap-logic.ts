import { v4 as uuidv4 } from "uuid"
import { TimelineSection, AudioSection, SectionedWaveform } from "@/components/preview/timeline/types"

export function useSplitAndSnap(
  sections: TimelineSection[],
  setSections: React.Dispatch<React.SetStateAction<TimelineSection[]>>,
  audioSections: AudioSection[],
  setAudioSections: React.Dispatch<React.SetStateAction<AudioSection[]>>,
  currentTime: number,
  saveToHistory?: null // This param is kept for backward compatibility but is not used anymore
) {
  const generateSectionWaveform = (
    startTime: number,
    endTime: number,
    sourceWaveform?: SectionedWaveform
  ): SectionedWaveform => {
    if (sourceWaveform && sourceWaveform.data && sourceWaveform.data.length > 0) {
      const { startTime: sourceStart, endTime: sourceEnd, data: sourceData } = sourceWaveform;
      const sourceRange = sourceEnd - sourceStart;

      const startRatio = (startTime - sourceStart) / sourceRange;
      const endRatio = (endTime - sourceStart) / sourceRange;

      if (startRatio >= 0 && endRatio <= 1 && startRatio < endRatio) {
        const startIndex = Math.floor(startRatio * sourceData.length);
        const endIndex = Math.ceil(endRatio * sourceData.length);

        const newData = sourceData.slice(startIndex, endIndex);

        return {
          startTime,
          endTime,
          data: newData.length > 0 ? newData : generateMockWaveform(startTime, endTime)
        };
      }
    }

    return {
      startTime,
      endTime,
      data: generateMockWaveform(startTime, endTime)
    };
  };

  const generateMockWaveform = (startTime: number, endTime: number): number[] => {
    const sectionDuration = endTime - startTime;
    const sampleCount = Math.max(20, Math.floor(100 * sectionDuration));

    return Array.from({ length: sampleCount }, () => Math.random() * 0.8 + 0.2);
  };

  const handleSplitAtPlayhead = () => {
    const sectionToSplit = sections.find(
      (section) => currentTime > section.startTime && currentTime < section.endTime
    );

    if (!sectionToSplit) {
      if (sections.length === 0 && currentTime === 0) {
        const newSectionId = uuidv4();

        const newSection: TimelineSection = {
          id: newSectionId,
          startTime: 0,
          endTime: 10,
          waveform: {
            startTime: 0,
            endTime: 10,
            data: generateMockWaveform(0, 10)
          },
          isLinkedToAudio: true,
          linkedAudioId: `audio-${newSectionId}`
        };

        const newAudioSection: AudioSection = {
          id: `audio-${newSectionId}`,
          startTime: 0,
          endTime: 10,
          waveform: {
            startTime: 0,
            endTime: 10,
            data: generateMockWaveform(0, 10)
          },
          isLinkedToVideo: true,
          linkedVideoId: newSectionId
        };

        setSections(prev => [...prev, newSection]);
        setAudioSections(prev => [...prev, newAudioSection]);
      }

      return;
    }

    if (currentTime - sectionToSplit.startTime < 0.5 ||
        sectionToSplit.endTime - currentTime < 0.5) {
      console.log("Can't split: too close to section edge");
      return;
    }

    const leftSection: TimelineSection = {
      id: sectionToSplit.id,
      startTime: sectionToSplit.startTime,
      endTime: currentTime,
      waveform: generateSectionWaveform(
        sectionToSplit.startTime,
        currentTime,
        sectionToSplit.waveform
      ),
      videoStartTime: sectionToSplit.videoStartTime,
      videoEndTime: sectionToSplit.videoEndTime
        ? sectionToSplit.videoStartTime! +
          ((currentTime - sectionToSplit.startTime) /
          (sectionToSplit.endTime - sectionToSplit.startTime)) *
          (sectionToSplit.videoEndTime - sectionToSplit.videoStartTime!)
        : undefined,
      originalStart: sectionToSplit.originalStart,
      originalEnd: sectionToSplit.originalEnd,
      isLinkedToAudio: sectionToSplit.isLinkedToAudio,
      linkedAudioId: sectionToSplit.linkedAudioId,
      thumbnail: sectionToSplit.thumbnail
    };

    const rightSectionId = uuidv4();
    const rightSection: TimelineSection = {
      id: rightSectionId,
      startTime: currentTime,
      endTime: sectionToSplit.endTime,
      waveform: generateSectionWaveform(
        currentTime,
        sectionToSplit.endTime,
        sectionToSplit.waveform
      ),
      videoStartTime: sectionToSplit.videoStartTime
        ? sectionToSplit.videoStartTime +
          ((currentTime - sectionToSplit.startTime) /
          (sectionToSplit.endTime - sectionToSplit.startTime)) *
          (sectionToSplit.videoEndTime! - sectionToSplit.videoStartTime)
        : undefined,
      videoEndTime: sectionToSplit.videoEndTime,
      originalStart: sectionToSplit.originalStart,
      originalEnd: sectionToSplit.originalEnd,
      isLinkedToAudio: sectionToSplit.isLinkedToAudio,
      linkedAudioId: sectionToSplit.linkedAudioId ? `audio-${rightSectionId}` : undefined,
      thumbnail: undefined
    };

    setSections((prevSections) => [
      ...prevSections.filter((s) => s.id !== sectionToSplit.id),
      leftSection,
      rightSection
    ]);

    if (sectionToSplit.isLinkedToAudio && sectionToSplit.linkedAudioId) {
      const audioToSplit = audioSections.find(
        (section) => section.id === sectionToSplit.linkedAudioId
      );

      if (audioToSplit) {
        const leftAudio: AudioSection = {
          id: audioToSplit.id,
          startTime: audioToSplit.startTime,
          endTime: currentTime,
          waveform: generateSectionWaveform(
            audioToSplit.startTime,
            currentTime,
            audioToSplit.waveform
          ),
          isLinkedToVideo: true,
          linkedVideoId: leftSection.id
        };

        const rightAudio: AudioSection = {
          id: `audio-${rightSectionId}`,
          startTime: currentTime,
          endTime: audioToSplit.endTime,
          waveform: generateSectionWaveform(
            currentTime,
            audioToSplit.endTime,
            audioToSplit.waveform
          ),
          isLinkedToVideo: true,
          linkedVideoId: rightSection.id
        };

        setAudioSections((prevAudioSections) => [
          ...prevAudioSections.filter((s) => s.id !== audioToSplit.id),
          leftAudio,
          rightAudio
        ]);
      }
    }
  };

  return {
    handleSplitAtPlayhead,
    generateSectionWaveform
  };
}
