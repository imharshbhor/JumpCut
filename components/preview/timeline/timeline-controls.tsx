"use client"

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setZoom } from "@/lib/store/slices/timelineSlice"
import {
    Scissors, ZoomIn, ZoomOut
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface TimelineControlsProps {
    onSplitAtPlayhead: () => void
}

export default function TimelineControls({
    onSplitAtPlayhead
}: TimelineControlsProps) {
    const dispatch = useAppDispatch()
    const { zoom } = useAppSelector((state) => state.timeline)

    const handleZoomIn = () => dispatch(setZoom(Math.min(zoom + 0.2, 2)))
    const handleZoomOut = () => dispatch(setZoom(Math.max(zoom - 0.2, 0.5)))

    return (
        <div className="flex justify-end items-center w-full">
            <div className="flex space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onSplitAtPlayhead}
                    title="Split at Playhead"
                    className="group relative flex items-center gap-1"
                >
                    <Scissors className="h-4 w-4" />
                    <span className="text-xs">Split</span>
                    <span className="sr-only">Split at Playhead</span>
                    <span className="absolute hidden group-hover:inline-block bg-secondary text-xs px-2 py-1 rounded -bottom-8 whitespace-nowrap">
                        Split at Playhead
                    </span>
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    title="Zoom In (+)"
                    className="group relative flex items-center gap-1"
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    title="Zoom Out (-)"
                    className="group relative flex items-center gap-1"
                >
                    <ZoomOut className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
