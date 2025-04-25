"use client"

import { useAppSelector } from "@/lib/store/hooks"
import { ScrollArea } from "@/components/ui/scroll-area"
import AudioManager from "@/components/audio/audio-panel"
import SubtitleEditor from "@/components/subtitles/subtitle-panel"
import ImageOverlayEditor from "@/components/image/image-panel"
import VideoPanel from "@/components/video/video-panel"

interface EditorPanelProps {
    activePanel: string
}

export default function EditorPanel({ activePanel }: EditorPanelProps) {
    const { videoUrl } = useAppSelector((state) => state.video)

    if (!videoUrl && activePanel !== "video") {
        return (
            <div className="w-80 border-r bg-background p-4 flex flex-col">
                <div className="flex-1 flex items-center justify-center text-center p-4 text-gray-500">
                    <div>
                        <p className="mb-2">Upload a video to start editing</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-80 border-r px-3 pt-5 bg-background flex flex-col">
            {/* <div className="p-3">
                <h2 className="text-xl tracking-tighter font-semibold mb-[0.6rem] capitalize">
                    {activePanel === "video"
                        ? "Video Library"
                        : activePanel === "text"
                            ? "Text & Captions"
                            : activePanel === "image"
                                ? "Image Overlays"
                                : activePanel === "audio"
                                    ? "Audio Tracks"
                                    : "Export Video"}
                </h2>
            </div> */}

            <ScrollArea className="flex-1">
                <div className="p-1">
                    {activePanel === "video" && <VideoPanel />}
                    {activePanel === "text" && <SubtitleEditor />}
                    {activePanel === "image" && <ImageOverlayEditor />}
                    {activePanel === "audio" && <AudioManager />}
                </div>
            </ScrollArea>
        </div>
    )
}
