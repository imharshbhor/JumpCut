"use client"

import { Button } from "@/components/ui/button"
import { FastForward, Maximize2, Pause, Play, Rewind, Volume2, VolumeX } from "lucide-react"
import { formatTime } from "@/lib/utils/video-utils"
import { Slider } from "@/components/ui/slider"

interface VideoControlsProps {
    currentTime: number
    duration: number
    isPlaying: boolean
    volume: number
    isMuted: boolean
    onPlayPause: () => void
    onSkipBack: () => void
    onSkipForward: () => void
    onVolumeChange: (value: number[]) => void
    onToggleMute: () => void
    onFullscreen: () => void
}

export default function VideoControls({
    currentTime,
    duration,
    isPlaying,
    volume,
    isMuted,
    onPlayPause,
    onSkipBack,
    onSkipForward,
    onVolumeChange,
    onToggleMute,
    onFullscreen
}: VideoControlsProps) {
    return (
        <>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-2 pt-4 z-10">
                <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-white font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>

                    <div className="flex items-center space-x-2 ml-[2.3rem]">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-background/20"
                            onClick={onSkipBack}
                        >
                            <Rewind size={16} />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-white hover:bg-background/20"
                            onClick={onPlayPause}
                        >
                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-background/20"
                            onClick={onSkipForward}
                        >
                            <FastForward size={16} />
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-background/20"
                            onClick={onToggleMute}
                        >
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </Button>

                        <div className="w-20">
                            <Slider
                                value={[isMuted ? 0 : volume]}
                                min={0}
                                max={1}
                                step={0.01}
                                onValueChange={onVolumeChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white bg-black/30 hover:bg-black/50"
                onClick={onFullscreen}
            >
                <Maximize2 className="h-4 w-4" />
            </Button>
        </>
    )
}
