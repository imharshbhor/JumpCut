"use client"

import { useAppSelector } from "@/lib/store/hooks"
import { ScrollArea } from "@/components/ui/scroll-area"
import AudioManager from "@/components/audio/audio-manager"
import SubtitleEditor from "@/components/subtitles/subtitle-editor"
import ImageOverlayEditor from "@/components/overlays/image-overlay-editor"
import ExportPanel from "@/components/export/export-panel"
import MediaPanel from "@/components/media/media-panel"

interface EditorPanelProps {
    activePanel: string
}

export default function EditorPanel({ activePanel }: EditorPanelProps) {
    const { videoUrl } = useAppSelector((state) => state.video)

    if (!videoUrl && activePanel !== "media") {
        return (
            <div className="w-80 border-r bg-white p-4 flex flex-col">
                <div className="flex-1 flex items-center justify-center text-center p-4 text-gray-500">
                    <div>
                        <p className="mb-2">Upload a video to start editing</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-80 border-r p-4 pt-[3.2rem] bg-white flex flex-col">
            <div className="p-3">
                {/* <h2 className="font-medium capitalize">
                    {activePanel === "media"
                        ? "Media Library"
                        : activePanel === "text"
                            ? "Text & Captions"
                            : activePanel === "image"
                                ? "Image Overlays"
                                : activePanel === "audio"
                                    ? "Audio Tracks"
                                    : "Export Video"}
                </h2> */}
            </div>

            {/* <ScrollArea className="flex-1"> */}
                <div className="p-2">
                    {activePanel === "media" && <MediaPanel />}
                    {activePanel === "text" && <SubtitleEditor />}
                    {activePanel === "image" && <ImageOverlayEditor />}
                    {activePanel === "audio" && <AudioManager />}
                    {activePanel === "export" && <ExportPanel />}
                </div>
            {/* </ScrollArea> */}
        </div>
    )
}
