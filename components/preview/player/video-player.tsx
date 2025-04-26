"use client"

import { useRef, useEffect } from "react"
import { useAppDispatch } from "@/lib/store/hooks"
import { setCurrentTime, setIsPlaying } from "@/lib/store/slices/timelineSlice"

interface VideoPlayerProps {
    videoUrl: string | null
    currentTime: number
    isPlaying: boolean
    volume: number
    isMuted: boolean
    onTimeUpdate: () => void
}

export default function VideoPlayer({
    videoUrl,
    currentTime,
    isPlaying,
    volume,
    isMuted,
    onTimeUpdate,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
            videoRef.current.currentTime = currentTime
        }
    }, [currentTime])

    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.play().catch(() => {
                    dispatch(setIsPlaying(false))
                })
            } else {
                videoRef.current.pause()
            }
        }
    }, [isPlaying, dispatch])

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = isMuted ? 0 : volume
        }
    }, [volume, isMuted])

    if (!videoUrl) {
        return (
            <div className="flex items-center justify-center h-full w-[70vh] text-white">
                <p>Upload a video to preview</p>
            </div>
        )
    }

    return (
        <video
            ref={videoRef}
            src={videoUrl}
            className="max-h-full max-w-full"
            onTimeUpdate={onTimeUpdate}
            onEnded={() => dispatch(setIsPlaying(false))}
        />
    )
}
