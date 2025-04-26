import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface VideoItem {
    id: string;
    file: File;
    url: string;
    name: string;
    size: number;
    type?: string;
    lastModified?: number;
    duration?: number;
    thumbnail?: string;
}

export interface VideoState {
    videos: VideoItem[];
    activeVideoId: string | null;
    videoFile: File | null;
    videoUrl: string | null;
    snapshots: [] | null;
    snapshotsLoading: boolean,
    waveform: [] | null;
    duration: number;
    isProcessing: boolean;
    thumbnail: string | null;
}

const initialState: VideoState = {
    videos: [],
    activeVideoId: null,
    videoFile: null,
    videoUrl: null,
    waveform: null,
    duration: 0,
    snapshots: null,
    snapshotsLoading: false,
    isProcessing: false,
    thumbnail: null,
}

const videoSlice = createSlice({
    name: "video",
    initialState,
    reducers: {
        setVideoFile: (state, action: PayloadAction<File>) => {
            state.videoFile = action.payload;
            state.videoUrl = URL.createObjectURL(action.payload);
            state.isProcessing = true;
        },
        addVideoFile: (state, action: PayloadAction<VideoItem>) => {
            state.videos.push(action.payload);

            if (!state.videoFile) {
                state.videoFile = action.payload.file;
                state.videoUrl = action.payload.url;
            }

            if (!state.activeVideoId) {
                state.activeVideoId = action.payload.id;
            }

            state.isProcessing = true;
        },
        setActiveVideo: (state, action: PayloadAction<string>) => {
            state.activeVideoId = action.payload;
            const video = state.videos.find(v => v.id === action.payload);
            if (video) {
                state.videoFile = video.file;
                state.videoUrl = video.url;
                state.thumbnail = video.thumbnail || null;
                state.duration = video.duration || 0;
            }
        },
        removeVideo: (state, action: PayloadAction<string>) => {
            const index = state.videos.findIndex(v => v.id === action.payload);
            if (index !== -1) {
                URL.revokeObjectURL(state.videos[index].url);
                state.videos.splice(index, 1);

                if (state.activeVideoId === action.payload) {
                    if (state.videos.length > 0) {
                        state.activeVideoId = state.videos[0].id;
                        state.videoFile = state.videos[0].file;
                        state.videoUrl = state.videos[0].url;
                        state.thumbnail = state.videos[0].thumbnail || null;
                        state.duration = state.videos[0].duration || 0;
                    } else {
                        state.activeVideoId = null;
                        state.videoFile = null;
                        state.videoUrl = null;
                        state.thumbnail = null;
                        state.duration = 0;
                    }
                }
            }
        },
        setVideoDuration: (state, action: PayloadAction<number>) => {
            state.duration = action.payload;

            if (state.activeVideoId) {
                const video = state.videos.find(v => v.id === state.activeVideoId);
                if (video) {
                    video.duration = action.payload;
                }
            }
        },
        setSnapshotsLoading(state, action) {
            state.snapshotsLoading = action.payload;
        },
        setSnapshots(state, action) {
            state.snapshots = action.payload;
            state.snapshotsLoading = false;
        },
        setProcessingComplete: (state) => {
            state.isProcessing = false;
        },
        setThumbnail: (state, action: PayloadAction<string>) => {
            state.thumbnail = action.payload;

            if (state.activeVideoId) {
                const video = state.videos.find(v => v.id === state.activeVideoId);
                if (video) {
                    video.thumbnail = action.payload;
                }
            }
        },
        setWaveform: (state, action) => {
            state.waveform = action.payload;
        },
        resetVideo: (state) => {
            if (state.videoUrl) URL.revokeObjectURL(state.videoUrl);
            state.videos.forEach(video => URL.revokeObjectURL(video.url));
            return initialState;
        },
    },
})

export const {
    setVideoFile,
    addVideoFile,
    setActiveVideo,
    removeVideo,
    setVideoDuration,
    setSnapshots,
    setWaveform,
    setSnapshotsLoading,
    setProcessingComplete,
    setThumbnail,
    resetVideo
} = videoSlice.actions

export default videoSlice.reducer
