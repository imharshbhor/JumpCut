"use client"

import { useState } from "react"
import { useAppSelector } from "@/lib/store/hooks"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Film, ImageIcon, Type, Music, Upload, Video, Layers, ScissorsSquareIcon, Scissors } from "lucide-react"
import VideoUpload from "@/components/media/video-upload"
import { AuroraText } from "../magicui/aurora-text"

interface SidebarProps {
    activePanel: string
    setActivePanel: (panel: string) => void
}

export default function Sidebar({ activePanel, setActivePanel }: SidebarProps) {
    const { videoFile, thumbnail } = useAppSelector((state) => state.video)
    const { images } = useAppSelector((state) => state.overlay)
    const [showUpload, setShowUpload] = useState(false)

    const handlePanelChange = (panel: string) => {
        setActivePanel(panel)
        if (panel === "media") {
            setShowUpload(false)
        }
    }

    return (
        <div className="bg-background flex flex-col h-full">
            <div className="p-5">
                <h1 className="text-2xl font-bold flex items-center tracking-tighter">
                    Jump<AuroraText colors={["#3894ff", "#80baff", "#8b5cf6"]}>Cut</AuroraText>
                </h1>
            </div>

            <div className="flex flex-col overflow-hidden">
                <div className="px-6 py-2">
                    <div className="space-y-2">
                        <Button
                            variant={activePanel === "media" ? "secondary" : "ghost"}
                            className="flex flex-col h-16 w-full items-center justify-center"
                            onClick={() => handlePanelChange("media")}
                        >
                            <Film />
                            <span className="text-sm">Media</span>
                        </Button>
                        <Button
                            variant={activePanel === "text" ? "secondary" : "ghost"}
                            className="flex flex-col h-16 w-full items-center justify-center"
                            onClick={() => handlePanelChange("text")}
                        >
                            <Type className="h-6 w-6 mb-1" />
                            <span className="text-xs">Text</span>
                        </Button>
                        <Button
                            variant={activePanel === "image" ? "secondary" : "ghost"}
                            className="flex flex-col h-16 w-full items-center justify-center"
                            onClick={() => handlePanelChange("image")}
                        >
                            <ImageIcon className="h-6 w-6 mb-1" />
                            <span className="text-xs">Images</span>
                        </Button>
                        <Button
                            variant={activePanel === "audio" ? "secondary" : "ghost"}
                            className="flex flex-col h-16 w-full items-center justify-center"
                            onClick={() => handlePanelChange("audio")}
                        >
                            <Music className="h-6 w-6 mb-1" />
                            <span className="text-xs">Audio</span>
                        </Button>
                        {/* <Button
                            variant={activePanel === "export" ? "secondary" : "ghost"}
                            className="flex flex-col h-16 w-full items-center justify-center"
                            onClick={() => handlePanelChange("export")}
                        >
                            <Layers className="h-6 w-6 mb-1" />
                            <span className="text-xs">Export</span>
                        </Button> */}
                    </div>
                </div>
            </div>
        </div>
    )
}
