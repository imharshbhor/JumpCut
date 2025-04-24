import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface AudioTrack {
  id: string
  name: string
  url: string
  startTime: number
  endTime: number
  volume: number
  isMuted: boolean
  waveform: number[] // Mock waveform data
}

export interface AudioState {
  tracks: AudioTrack[]
  masterVolume: number
}

const initialState: AudioState = {
  tracks: [],
  masterVolume: 1,
}

const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    addAudioTrack: (state, action: PayloadAction<AudioTrack>) => {
      state.tracks.push(action.payload)
    },
    removeAudioTrack: (state, action: PayloadAction<string>) => {
      state.tracks = state.tracks.filter((track) => track.id !== action.payload)
    },
    updateAudioTrack: (state, action: PayloadAction<Partial<AudioTrack> & { id: string }>) => {
      const index = state.tracks.findIndex((track) => track.id === action.payload.id)
      if (index !== -1) {
        state.tracks[index] = { ...state.tracks[index], ...action.payload }
      }
    },
    setMasterVolume: (state, action: PayloadAction<number>) => {
      state.masterVolume = action.payload
    },
    resetAudio: () => initialState,
  },
})

export const { addAudioTrack, removeAudioTrack, updateAudioTrack, setMasterVolume, resetAudio } = audioSlice.actions

export default audioSlice.reducer
