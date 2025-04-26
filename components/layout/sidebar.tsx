"use client"

import { Button } from "@/components/ui/button"
import { Film, ImageIcon, Type, Music } from "lucide-react"
import { AuroraText } from "../ui/aurora-text"

interface SidebarProps {
    activePanel: string
    setActivePanel: (panel: string) => void
}

export default function Sidebar({ activePanel, setActivePanel }: SidebarProps) {

    const handlePanelChange = (panel: string) => {
        setActivePanel(panel)
    }

    return (
        <div className="bg-background flex flex-col h-full border-r">
            <div className="p-5">
                <h1 className="text-2xl font-bold flex items-center tracking-tighter">
                    Jump<AuroraText colors={["#3894ff", "#8b5cf6"]}>Cut</AuroraText>
                </h1>
            </div>

            <div className="flex flex-col overflow-hidden">
                <div className="px-8 py-1">
                    <div className="space-y-4">
                        <Button
                            variant={activePanel === "video" ? "secondary" : "ghost"}
                            className="flex flex-col h-18 w-full items-center justify-center"
                            onClick={() => handlePanelChange("video")}
                        >
                            <Film className="!h-6 !w-6" />
                            <span className="text-xs">Videos</span>
                        </Button>
                        <Button
                            variant={activePanel === "text" ? "secondary" : "ghost"}
                            className="flex flex-col h-18 w-full items-center justify-center"
                            onClick={() => handlePanelChange("text")}
                        >
                            <Type className="!h-6 !w-6" />
                            <span className="text-xs">Text</span>
                        </Button>
                        <Button
                            variant={activePanel === "image" ? "secondary" : "ghost"}
                            className="flex flex-col h-18 w-full items-center justify-center"
                            onClick={() => handlePanelChange("image")}
                        >
                            <ImageIcon className="!h-6 !w-6" />
                            <span className="text-xs">Images</span>
                        </Button>
                        <Button
                            variant={activePanel === "audio" ? "secondary" : "ghost"}
                            className="flex flex-col h-18 w-full items-center justify-center"
                            onClick={() => handlePanelChange("audio")}
                        >
                            <Music className="!h-6 !w-6" />
                            <span className="text-xs">Audio</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
