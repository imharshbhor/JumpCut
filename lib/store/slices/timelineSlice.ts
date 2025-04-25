import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Scene {
  id: string
  startTime: number
  endTime: number
  thumbnail: string
}

export interface TimelineState {
  scenes: Scene[]
  currentTime: number
  isPlaying: boolean
  zoom: number
}

const initialState: TimelineState = {
  scenes: [],
  currentTime: 0,
  isPlaying: false,
  zoom: 0.5,
}

const timelineSlice = createSlice({
  name: "timeline",
  initialState,
  reducers: {
    addScene: (state, action: PayloadAction<Scene>) => {
      state.scenes.push(action.payload)
    },
    removeScene: (state, action: PayloadAction<string>) => {
      state.scenes = state.scenes.filter((scene) => scene.id !== action.payload)
    },
    updateScene: (state, action: PayloadAction<Scene>) => {
      const index = state.scenes.findIndex((scene) => scene.id === action.payload.id)
      if (index !== -1) {
        state.scenes[index] = action.payload
      }
    },
    reorderScenes: (state, action: PayloadAction<Scene[]>) => {
      state.scenes = action.payload
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload
    },
    resetTimeline: () => initialState,
  },
})

export const {
  addScene,
  removeScene,
  updateScene,
  reorderScenes,
  setCurrentTime,
  setIsPlaying,
  setZoom,
  resetTimeline,
} = timelineSlice.actions

export default timelineSlice.reducer
