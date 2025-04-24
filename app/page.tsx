"use client"
import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { resetVideo, setSnapshots } from "@/lib/store/slices/videoSlice"
import { resetTimeline } from "@/lib/store/slices/timelineSlice"
import { resetAudio } from "@/lib/store/slices/audioSlice"
import { resetSubtitles } from "@/lib/store/slices/subtitleSlice"
import { resetOverlays } from "@/lib/store/slices/overlaySlice"
import Sidebar from "@/components/layout/sidebar"
import EditorHeader from "@/components/layout/editor-header"
import VideoPreview from "@/components/preview/video-preview"
import Timeline from "@/components/timeline/timeline"
import EditorPanel from "@/components/layout/editor-panel"
import { generateVideoThumbnails } from "@/lib/utils/video-utils"
import EmptyVideoPreview from "@/components/preview/empty-video-preview"
import EmptyTimeline from "@/components/timeline/empty-timeline"
import { Loader2 } from "lucide-react"

export default function VideoEditor() {
    const dispatch = useAppDispatch()
    const [activePanel, setActivePanel] = useState<string>("media")
    const { videoUrl, snapshots, snapshotsLoading } = useAppSelector((state) => state.video)

    useEffect(() => {
        if (!videoUrl && activePanel !== "media") {
            setActivePanel("media")
        }
    }, [videoUrl, activePanel])

    const handleReset = () => {
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl)
        }
        dispatch(resetVideo())
        dispatch(resetTimeline())
        dispatch(resetAudio())
        dispatch(resetSubtitles())
        dispatch(resetOverlays())
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ userSelect: 'none' }}>
            <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />
                        <EditorPanel activePanel={activePanel} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <EditorHeader onReset={handleReset} />
                <div className="flex flex-1 overflow-hidden">
                    <div className="flex flex-col flex-1 overflow-hidden p-4">
                        {snapshotsLoading ? (
                            <div className="flex flex-col flex-1 items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                                <p className="text-sm text-gray-500 mt-2">Loading video...</p>
                            </div>
                        ) : snapshots && snapshots.length > 0 ? (
                            <div className="flex flex-col gap-4 mt-4 overflow-hidden">
                                <VideoPreview />
                                <div className="mt-4 flex-shrink-0">
                                    <Timeline />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 mt-4 overflow-hidden">
                                <EmptyVideoPreview />
                                <div className="mt-4 flex-shrink-0">
                                    <EmptyTimeline />
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}
