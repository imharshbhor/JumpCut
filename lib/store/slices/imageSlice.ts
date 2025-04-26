import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface ImageOverlay {
  id: string
  url: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  opacity: number
  startTime: number
  endTime: number
  zIndex: number
  border?: {
    width: number
    color: string
    style: string
  }
  animation?: {
    type: string
    duration: number
  }
}

export interface OverlayState {
  images: ImageOverlay[]
  selectedOverlayId: string | null
}

const initialState: OverlayState = {
  images: [],
  selectedOverlayId: null,
}

const overlaySlice = createSlice({
  name: "overlay",
  initialState,
  reducers: {
    addImageOverlay: (state, action: PayloadAction<ImageOverlay>) => {
      state.images.push(action.payload)
    },
    removeImageOverlay: (state, action: PayloadAction<string>) => {
      state.images = state.images.filter((image) => image.id !== action.payload)
    },
    updateImageOverlay: (state, action: PayloadAction<Partial<ImageOverlay> & { id: string }>) => {
      const index = state.images.findIndex((image) => image.id === action.payload.id)
      if (index !== -1) {
        state.images[index] = { ...state.images[index], ...action.payload }
      }
    },
    resetImages: () => initialState,
  },
})

export const {
  addImageOverlay,
  removeImageOverlay,
  updateImageOverlay,
  resetImages,
} = overlaySlice.actions

export default overlaySlice.reducer
