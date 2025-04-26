"use client"

import { AudioTrack } from "@/lib/store/slices/audioSlice"
import TimingControls from "@/components/shared/timing-controls"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Play, Pause } from "lucide-react"

interface AudioTimingProps {
    track: AudioTrack
    onUpdateTiming: (id: string, startTime: number, endTime: number) => void
    videoUrl?: string | null
    videoDuration?: number
}

export default function AudioTiming({ track, onUpdateTiming, videoUrl, videoDuration = 60 }: AudioTimingProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

    useEffect(() => {
        if (track.url) {
            const audio = new Audio(track.url)
            setAudioElement(audio)

            return () => {
                audio.pause()
                audio.src = ""
            }
        }
    }, [track.url])

    const togglePlayback = () => {
        if (!audioElement) return

        if (isPlaying) {
            audioElement.pause()
        } else {
            audioElement.currentTime = track.startTime
            audioElement.play()

            const checkTime = () => {
                if (audioElement.currentTime >= track.endTime) {
                    audioElement.pause()
                    setIsPlaying(false)
                    audioElement.removeEventListener('timeupdate', checkTime)
                }
            }

            audioElement.addEventListener('timeupdate', checkTime)
        }

        setIsPlaying(!isPlaying)
    }

    const handleStartTimeChange = (time: number) => {
        onUpdateTiming(track.id, time, track.endTime)
    }

    const handleEndTimeChange = (time: number) => {
        onUpdateTiming(track.id, track.startTime, time)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlayback}
                    className="h-8 w-8"
                >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span className="text-sm font-medium">Preview Audio Timing</span>
            </div>

            <TimingControls
                startTime={track.startTime}
                endTime={track.endTime}
                duration={videoDuration}
                onStartTimeChange={handleStartTimeChange}
                onEndTimeChange={handleEndTimeChange}
                minDuration={0.1}
                maxDuration={track.endTime - track.startTime + 60} // Allow extending by up to 60 seconds
            />
        </div>
    )
}
