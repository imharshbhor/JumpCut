"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { AudioTrack } from "@/lib/store/slices/audioSlice"
import {
    Volume2,
    VolumeX,
    Trash2,
    ChevronUp,
    ChevronDown,
    Play,
    Pause
} from "lucide-react"
import AudioWaveform from "./audio-waveform"

interface AudioControlsProps {
    track: AudioTrack
    isPlaying: boolean
    setIsPlaying: (isPlaying: boolean) => void
    currentTime: number
    setCurrentTime: (time: number) => void
    onVolumeChange: (id: string, volume: number) => void
    onToggleMute: (id: string) => void
    onRemove: (id: string) => void
    isSoloed: boolean
    isActive: boolean
}

export default function AudioControls({
    track,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    onVolumeChange,
    onToggleMute,
    onRemove,
    isActive
}: AudioControlsProps) {
    const [expanded, setExpanded] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const mockWaveform = track.waveform || Array(50).fill(0).map(() => Math.random() * 128 + 10)

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(track.url)
        } else {
            audioRef.current.src = track.url
        }

        audioRef.current.volume = track.volume
        audioRef.current.muted = track.isMuted

        audioRef.current.currentTime = track.startTime

        const handleTimeUpdate = () => {
            if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime)

                if (audioRef.current.currentTime >= track.endTime) {
                    audioRef.current.pause()
                    setIsPlaying(false)
                }
            }
        }

        audioRef.current.addEventListener('timeupdate', handleTimeUpdate)

        return () => {
            audioRef.current?.removeEventListener('timeupdate', handleTimeUpdate)
            audioRef.current?.pause()
        }
    }, [track.url, track.startTime, track.endTime, setCurrentTime, setIsPlaying])

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                if (audioRef.current.currentTime >= track.endTime) {
                    audioRef.current.currentTime = track.startTime
                }
                audioRef.current.play().catch(err => console.error("Error playing audio:", err))
            } else {
                audioRef.current.pause()
            }
        }
    }, [isPlaying, track.startTime, track.endTime])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = track.volume
            audioRef.current.muted = track.isMuted
        }
    }, [track.volume, track.isMuted])

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ""
            }
        }
    }, [])

    const handleVolumeChange = (values: number[]) => {
        onVolumeChange(track.id, values[0])
    }

    const togglePlayback = () => {
        setIsPlaying(!isPlaying)
    }

    const progress = Math.max(0, Math.min(1, (currentTime - track.startTime) / (track.endTime - track.startTime)))

    return (
        <div className="border rounded-md mb-2 max-w-[18.6vw] overflow-hidden bg-background">
            <div className="flex items-center p-2 gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpanded(!expanded)}
                    className="h-8 w-8"
                >
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlayback}
                    className="h-8 w-8"
                >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </Button>

                <div className="flex-1 font-medium truncate">{track.name}</div>

                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${track.isMuted ? 'text-muted-foreground' : ''}`}
                    onClick={() => onToggleMute(track.id)}
                >
                    {track.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => onRemove(track.id)}
                >
                    <Trash2 size={16} />
                </Button>
            </div>

            {expanded && (
                <div className="p-2 pt-0 pb-3 border-t">
                    <div className="flex items-center gap-2 mb-2">
                        <Volume2 size={16} className="text-muted-foreground" />
                        <Slider
                            value={[track.volume * 100]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={handleVolumeChange}
                            className="flex-1"
                        />
                        <span className="text-xs tabular-nums w-8 text-right">{Math.round(track.volume * 100)}%</span>
                    </div>

                    <div className="mt-3">
                        <AudioWaveform
                            waveform={mockWaveform}
                            width={350}
                            height={40}
                            isMuted={track.isMuted}
                            isActive={isActive}
                            progress={progress}
                        />
                    </div>

                    <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                        <span>{formatTime(track.startTime)}</span>
                        <span>{formatTime(track.endTime)}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)

    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}
