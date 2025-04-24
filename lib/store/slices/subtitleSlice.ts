import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Subtitle {
  id: string
  text: string
  startTime: number
  endTime: number
  position: { x: number; y: number }
  style: {
    fontFamily: string
    fontSize: number
    color: string
    backgroundColor: string
    opacity: number
    textAlign?: string
  }
}

export interface SubtitleState {
  subtitles: Subtitle[]
}

const initialState: SubtitleState = {
  subtitles: [],
}

const subtitleSlice = createSlice({
  name: "subtitle",
  initialState,
  reducers: {
    addSubtitle: (state, action: PayloadAction<Subtitle>) => {
      state.subtitles.push(action.payload)
    },
    removeSubtitle: (state, action: PayloadAction<string>) => {
      state.subtitles = state.subtitles.filter((subtitle) => subtitle.id !== action.payload)
    },
    updateSubtitle: (state, action: PayloadAction<Partial<Subtitle> & { id: string }>) => {
      const index = state.subtitles.findIndex((subtitle) => subtitle.id === action.payload.id)
      if (index !== -1) {
        state.subtitles[index] = { ...state.subtitles[index], ...action.payload }
      }
    },
    resetSubtitles: () => initialState,
  },
})

export const { addSubtitle, removeSubtitle, updateSubtitle, resetSubtitles } = subtitleSlice.actions

export default subtitleSlice.reducer
