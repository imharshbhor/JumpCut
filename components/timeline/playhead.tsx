"use client"

import { useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setCurrentTime } from "@/lib/store/slices/timelineSlice"
import { formatTime } from "@/lib/utils/video-utils"

interface PlayheadProps {
    duration: number
    getTimeFromMousePosition: (clientX: number) => number
}

export default function Playhead({ duration, getTimeFromMousePosition }: PlayheadProps) {
    const dispatch = useAppDispatch()
    const { currentTime, zoom } = useAppSelector((state) => state.timeline)
    const playheadDraggingRef = useRef(false)

    // Calculate the playhead position as a percentage of the timeline
    const playheadPosition = (currentTime / duration) * 100

    // Handle playhead drag
    const handlePlayheadDrag = (e: MouseEvent) => {
        if (!playheadDraggingRef.current) return
        const newTime = getTimeFromMousePosition(e.clientX)
        dispatch(setCurrentTime(Math.min(Math.max(newTime, 0), duration)))
    }

    // Handle playhead drag start
    const handlePlayheadDragStart = (e: React.MouseEvent) => {
        e.preventDefault()
        playheadDraggingRef.current = true

        const handleMouseMove = (e: MouseEvent) => handlePlayheadDrag(e)

        const handleMouseUp = () => {
            playheadDraggingRef.current = false
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
        }

        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
    }

    return (
        <>
            {/* Playhead */}
            <div
                className="absolute top-0 bottom-0 w-[3px] bg-red-500 z-20"
                style={{ left: `${playheadPosition}%` }}
                onMouseDown={handlePlayheadDragStart}
            >
                <div className="absolute -left-2 -top-4 w-6 h-4 bg-red-500 rounded-md flex items-center justify-center cursor-move">
                    <div className="w-1 h-2 bg-background rounded-sm" />
                </div>
            </div>

            {/* Current time indicator */}
            <div
                className="absolute -top-8 text-xs font-mono text-white bg-red-700 px-1.5 py-0.5 rounded-md transform -translate-x-1/2 z-10 border border-red-500"
                style={{ left: `${playheadPosition}%` }}
            >
                {formatTime(currentTime)}
            </div>
        </>
    )
}
