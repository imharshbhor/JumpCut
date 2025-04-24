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
        <div className="w-36 bg-white border-r flex flex-col h-full">
            <div className="p-[0.85rem]">
                <h1 className="text-2xl ml-[1rem] mt-2 font-bold flex items-center tracking-tighter">
                    Move<AuroraText colors={["#3894ff", "#80baff", "#8b5cf6"]}>37</AuroraText>
                </h1>
            </div>

            <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 sidebar-section">
                    {/* <h2 className="text-sm font-medium mb-2">Create</h2> */}
                    <div className="space-y-1">
                        <Button
                            variant={activePanel === "media" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handlePanelChange("media")}
                        >
                            <Film className="mr-2 h-4 w-4" />
                            Media
                        </Button>
                        <Button
                            variant={activePanel === "text" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handlePanelChange("text")}
                        >
                            <Type className="mr-2 h-4 w-4" />
                            Text
                        </Button>
                        <Button
                            variant={activePanel === "image" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handlePanelChange("image")}
                        >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Images
                        </Button>
                        <Button
                            variant={activePanel === "audio" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handlePanelChange("audio")}
                        >
                            <Music className="mr-2 h-4 w-4" />
                            Audio
                        </Button>
                        <Button
                            variant={activePanel === "export" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handlePanelChange("export")}
                        >
                            <Layers className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
