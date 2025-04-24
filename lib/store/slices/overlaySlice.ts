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
}

export interface TextOverlay {
  id: string
  text: string
  position: { x: number; y: number }
  style: {
    fontFamily: string
    fontSize: number
    color: string
    backgroundColor: string
    opacity: number
    bold: boolean
    italic: boolean
    underline: boolean
  }
  startTime: number
  endTime: number
  zIndex: number
}

export interface OverlayState {
  images: ImageOverlay[]
  texts: TextOverlay[]
  selectedOverlayId: string | null
}

const initialState: OverlayState = {
  images: [],
  texts: [],
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
    addTextOverlay: (state, action: PayloadAction<TextOverlay>) => {
      state.texts.push(action.payload)
    },
    removeTextOverlay: (state, action: PayloadAction<string>) => {
      state.texts = state.texts.filter((text) => text.id !== action.payload)
    },
    updateTextOverlay: (state, action: PayloadAction<Partial<TextOverlay> & { id: string }>) => {
      const index = state.texts.findIndex((text) => text.id === action.payload.id)
      if (index !== -1) {
        state.texts[index] = { ...state.texts[index], ...action.payload }
      }
    },
    setSelectedOverlay: (state, action: PayloadAction<string | null>) => {
      state.selectedOverlayId = action.payload
    },
    resetOverlays: () => initialState,
  },
})

export const {
  addImageOverlay,
  removeImageOverlay,
  updateImageOverlay,
  addTextOverlay,
  removeTextOverlay,
  updateTextOverlay,
  setSelectedOverlay,
  resetOverlays,
} = overlaySlice.actions

export default overlaySlice.reducer
