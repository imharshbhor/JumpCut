"use client"

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setZoom } from "@/lib/store/slices/timelineSlice"
import {
    Music, ScissorsLineDashed, ZoomIn, ZoomOut as ZoomOutIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface TimelineControlsProps {
    onSplitAtPlayhead: () => void
    showAudioTrack: boolean
    setShowAudioTrack: React.Dispatch<React.SetStateAction<boolean>>
}

export default function TimelineControls({
    onSplitAtPlayhead,
    showAudioTrack,
    setShowAudioTrack
}: TimelineControlsProps) {
    const dispatch = useAppDispatch()
    const { zoom } = useAppSelector((state) => state.timeline)

    const handleZoomIn = () => dispatch(setZoom(Math.min(zoom + 0.2, 2)))
    const handleZoomOut = () => dispatch(setZoom(Math.max(zoom - 0.2, 0.5)))

    return (
        <div className="flex space-x-2 mb-2 bg-secondary p-2 rounded-xl justify-between">
            <div className="flex items-center space-x-2 pl-2">
                    <ScissorsLineDashed className="cursor-pointer" size={20} onClick={onSplitAtPlayhead}/>
            </div>

            <div className="flex items-center space-x-2 pr-2">
                    <ZoomIn size={16} className="cursor-pointer" onClick={handleZoomIn}/>
                    <ZoomOutIcon size={16} className="cursor-pointer" onClick={handleZoomOut}/>
            </div>
        </div>
    )
}
