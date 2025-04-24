import { configureStore } from "@reduxjs/toolkit"
import videoReducer from "./slices/videoSlice"
import timelineReducer from "./slices/timelineSlice"
import audioReducer from "./slices/audioSlice"
import subtitleReducer from "./slices/subtitleSlice"
import overlayReducer from "./slices/overlaySlice"

export const store = configureStore({
  reducer: {
    video: videoReducer,
    timeline: timelineReducer,
    audio: audioReducer,
    subtitle: subtitleReducer,
    overlay: overlayReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['video/setVideoFile', 'video/addVideoFile'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.file', 'meta.arg'],
        // Ignore these paths in the state
        ignoredPaths: ['video.videoFile', 'video.videos'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
