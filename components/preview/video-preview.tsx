"use client"

import { useRef, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { setCurrentTime, setIsPlaying } from "@/lib/store/slices/timelineSlice"
import { Button } from "@/components/ui/button"
import { FastForward, Maximize2, Pause, Play, Rewind, Volume2, VolumeX } from "lucide-react"
import { formatTime } from "@/lib/utils/video-utils"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

export default function VideoPreview() {
    const dispatch = useAppDispatch()
    const videoRef = useRef<HTMLVideoElement>(null)
    const previewRef = useRef<HTMLDivElement>(null)
    const { videoUrl, duration } = useAppSelector((state) => state.video)
    const { currentTime, isPlaying } = useAppSelector((state) => state.timeline)
    const { subtitles } = useAppSelector((state) => state.subtitle)
    const { images, texts } = useAppSelector((state) => state.overlay)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)

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
            videoRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const handleTimeUpdate = () => {
        if (videoRef.current && !isNaN(videoRef.current.currentTime)) {
            dispatch(setCurrentTime(videoRef.current.currentTime))
        }
    }

    const handleFullscreen = () => {
        if (previewRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen()
            } else {
                previewRef.current.requestFullscreen()
            }
        }
    }

    const handlePlayPause = () => {
        dispatch(setIsPlaying(!isPlaying))
    }

    const handleSkipBack = () => {
        const newTime = Math.max(currentTime - 5, 0)
        dispatch(setCurrentTime(newTime))
    }

    const handleSkipForward = () => {
        const newTime = Math.min(currentTime + 5, duration)
        dispatch(setCurrentTime(newTime))
    }

    const handleVolumeChange = (newVolume: number[]) => {
        setVolume(newVolume[0])
        if (newVolume[0] > 0 && isMuted) {
            setIsMuted(false)
        }
    }

    const toggleMute = () => {
        setIsMuted(!isMuted)
    }

    const activeSubtitles = subtitles.filter(
        (subtitle) => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime,
    )

    const activeImages = images.filter((image) => currentTime >= image.startTime && currentTime <= image.endTime)

    const activeTexts = texts.filter((text) => currentTime >= text.startTime && currentTime <= text.endTime)

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center">
            <div
                ref={previewRef}
                className="relative flex h-[48vh] bg-black rounded-lg overflow-hidden items-center justify-center"
            >
                {videoUrl ? (
                    <>
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            className="max-h-full max-w-full"
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={() => dispatch(setIsPlaying(false))}
                        />

                        {activeSubtitles.map((subtitle) => (
                            <div
                                key={subtitle.id}
                                className="absolute"
                                style={{
                                    left: `${subtitle.position.x}%`,
                                    top: `${subtitle.position.y}%`,
                                    transform: "translate(-50%, -50%)",
                                    fontFamily: subtitle.style.fontFamily,
                                    fontSize: `${subtitle.style.fontSize}px`,
                                    color: subtitle.style.color,
                                    backgroundColor: `${subtitle.style.backgroundColor}${Math.round(subtitle.style.opacity * 255)
                                        .toString(16)
                                        .padStart(2, "0")}`,
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "0.25rem",
                                    textAlign: subtitle.style.textAlign || "center",
                                    maxWidth: "80%",
                                    zIndex: 10,
                                }}
                            >
                                {subtitle.text}
                            </div>
                        ))}

                        {/* Image Overlays */}
                        {activeImages.map((image) => (
                            <div
                                key={image.id}
                                className="absolute"
                                style={{
                                    left: `${image.position.x}%`,
                                    top: `${image.position.y}%`,
                                    transform: `translate(-50%, -50%) rotate(${image.rotation}deg)`,
                                    width: `${image.size.width}px`,
                                    height: `${image.size.height}px`,
                                    opacity: image.opacity,
                                    zIndex: image.zIndex,
                                }}
                            >
                                <img src={image.url || "/placeholder.svg"} alt="Overlay" className="w-full h-full object-contain" />
                            </div>
                        ))}

                        {/* Text Overlays */}
                        {activeTexts.map((text) => (
                            <div
                                key={text.id}
                                className="absolute"
                                style={{
                                    left: `${text.position.x}%`,
                                    top: `${text.position.y}%`,
                                    transform: "translate(-50%, -50%)",
                                    fontFamily: text.style.fontFamily,
                                    fontSize: `${text.style.fontSize}px`,
                                    color: text.style.color,
                                    backgroundColor: `${text.style.backgroundColor}${Math.round(text.style.opacity * 255)
                                        .toString(16)
                                        .padStart(2, "0")}`,
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "0.25rem",
                                    textAlign: "center",
                                    maxWidth: "80%",
                                    fontWeight: text.style.bold ? "bold" : "normal",
                                    fontStyle: text.style.italic ? "italic" : "normal",
                                    textDecoration: text.style.underline ? "underline" : "none",
                                    zIndex: text.zIndex,
                                }}
                            >
                                {text.text}
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full w-[70vh] text-white">
                        <p>Upload a video to preview</p>
                    </div>
                )}

                {/* Video controls overlay */}
                {videoUrl && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-2 pt-4">
                        {/* Playback controls */}
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-white font-mono">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </div>

                            <div className="flex items-center space-x-2 ml-5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white hover:bg-background/20"
                                    onClick={handleSkipBack}
                                >
                                    <Rewind size={16} />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-white hover:bg-background/20"
                                    onClick={handlePlayPause}
                                >
                                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white hover:bg-background/20"
                                    onClick={handleSkipForward}
                                >
                                    <FastForward size={16} />
                                </Button>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white hover:bg-background/20"
                                    onClick={toggleMute}
                                >
                                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </Button>

                                <div className="w-20">
                                    <Slider
                                        value={[isMuted ? 0 : volume]}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        onValueChange={handleVolumeChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Fullscreen button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-white bg-black/30 hover:bg-black/50"
                    onClick={handleFullscreen}
                >
                    <Maximize2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
