export interface SectionedWaveform {
  startTime: number;
  endTime: number;
  data: number[];
}

export interface TimelineSection {
  id: string;
  startTime: number;
  endTime: number;
  waveform: SectionedWaveform;
  videoStartTime?: number;
  videoEndTime?: number;
  originalStart?: number;
  originalEnd?: number;
  isLinkedToAudio?: boolean;
  linkedAudioId?: string;
  thumbnail?: string;
  isLinkedToVideo?: boolean;
  linkedVideoId?: string;
}

export interface VideoSnapshot {
  time: number;
  url: string;
}

export interface AudioSection {
  id: string;
  startTime: number;
  endTime: number;
  waveform: SectionedWaveform;
  isLinkedToVideo: boolean;
  linkedVideoId?: string;
  originalStart?: number;
  originalEnd?: number;
}
