"use client"

import { useRef, useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { setCurrentTime, setIsPlaying } from "@/lib/store/slices/timelineSlice"
import { updateSubtitle } from "@/lib/store/slices/subtitleSlice"
import { updateImageOverlay } from "@/lib/store/slices/overlaySlice"
import { Button } from "@/components/ui/button"
import { FastForward, Maximize2, Pause, Play, Rewind, Volume2, VolumeX } from "lucide-react"
import { formatTime } from "@/lib/utils/video-utils"
import { Slider } from "@/components/ui/slider"

// Video Controls Component
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

function VideoControls({
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
            {/* Video controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-2 pt-4 z-10">
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

            {/* Fullscreen button */}
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

// Image Overlay Component
interface ImageOverlayProps {
    image: any // Replace with proper type from your store
    isDragging: boolean
    isSelected: boolean
    onDragStart: (e: React.MouseEvent, id: string, type: 'subtitle' | 'image' | 'text') => void
    onResizeStart: (e: React.MouseEvent, id: string, handle: string) => void
}

function ImageOverlay({
    image,
    isDragging,
    isSelected,
    onDragStart,
    onResizeStart
}: ImageOverlayProps) {
    return (
        <div
            key={image.id}
            className={`absolute resizable-image ${isSelected ? 'selected' : ''} ${image.animation?.type && image.animation.type !== 'none' ? `animate-${image.animation.type}` : ''}`}
            style={{
                left: `${image.position.x}%`,
                top: `${image.position.y}%`,
                transform: `translate(-50%, -50%) rotate(${image.rotation}deg)`,
                width: `${image.size.width}px`,
                height: `${image.size.height}px`,
                opacity: image.opacity,
                zIndex: image.zIndex,
                animationDuration: image.animation?.duration ? `${image.animation.duration}s` : undefined,
                border: image.border ? `${image.border.width}px ${image.border.style} ${image.border.color}` : undefined
            }}
            onMouseDown={(e) => onDragStart(e, image.id, 'image')}
        >
            <img
                src={image.url || "/placeholder.svg"}
                alt="Overlay"
                draggable="false"
            />

            {/* Resize handles */}
            <div
                className="resize-handle resize-handle-nw"
                onMouseDown={(e) => onResizeStart(e, image.id, 'nw')}
            ></div>
            <div
                className="resize-handle resize-handle-ne"
                onMouseDown={(e) => onResizeStart(e, image.id, 'ne')}
            ></div>
            <div
                className="resize-handle resize-handle-sw"
                onMouseDown={(e) => onResizeStart(e, image.id, 'sw')}
            ></div>
            <div
                className="resize-handle resize-handle-se"
                onMouseDown={(e) => onResizeStart(e, image.id, 'se')}
            ></div>
        </div>
    )
}

// Subtitle Component
interface SubtitleOverlayProps {
    subtitle: any // Replace with proper type from your store
    onDragStart: (e: React.MouseEvent, id: string, type: 'subtitle' | 'image' | 'text') => void
}

function SubtitleOverlay({
    subtitle,
    onDragStart
}: SubtitleOverlayProps) {
    return (
        <div
            key={subtitle.id}
            className="absolute cursor-move"
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
                textAlign: subtitle.style.textAlign as "left" | "center" | "right" | undefined || "center",
                maxWidth: "80%",
                zIndex: 10,
            }}
            onMouseDown={(e) => onDragStart(e, subtitle.id, 'subtitle')}
        >
            {subtitle.text}
        </div>
    )
}

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
    const [draggedElement, setDraggedElement] = useState<{ id: string, type: 'subtitle' | 'image' | 'text' } | null>(null)
    const [resizingImage, setResizingImage] = useState<{ id: string, handle: string } | null>(null)
    const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 })
    const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
    const [initialImagePosition, setInitialImagePosition] = useState({ x: 0, y: 0 })

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

    const handleDragStart = (e: React.MouseEvent, id: string, type: 'subtitle' | 'image' | 'text') => {
        if (isPlaying) {
            dispatch(setIsPlaying(false))
        }

        e.preventDefault()
        let selectedElement = null

        if (type === 'image') {
            selectedElement = images.find(img => img.id === id)
        } else if (type === 'subtitle') {
            selectedElement = subtitles.find(sub => sub.id === id)
        }

        if (!selectedElement) return
        setDraggedElement({ id, type })

        // Save the initial position for proper calculation
        if (previewRef.current) {
            const rect = previewRef.current.getBoundingClientRect()
            setInitialPosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            })
        }
    }

    const handleDrag = (e: React.MouseEvent) => {
        if (!draggedElement || !previewRef.current) return

        const rect = previewRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        // Ensure coordinates stay within bounds
        const boundedX = Math.max(0, Math.min(100, x))
        const boundedY = Math.max(0, Math.min(100, y))

        if (draggedElement.type === 'subtitle') {
            dispatch(updateSubtitle({
                id: draggedElement.id,
                position: { x: boundedX, y: boundedY }
            }))
        } else if (draggedElement.type === 'image') {
            dispatch(updateImageOverlay({
                id: draggedElement.id,
                position: { x: boundedX, y: boundedY }
            }))
        }
    }

    const handleDragEnd = () => {
        setDraggedElement(null)
    }

    const handleResizeStart = (e: React.MouseEvent, id: string, handle: string) => {
        e.stopPropagation()
        e.preventDefault()
        if (isPlaying) {
            dispatch(setIsPlaying(false))
        }

        // Find the current image
        const image = images.find(img => img.id === id)
        if (!image) return

        setResizingImage({ id, handle })
        setInitialSize({ width: image.size.width, height: image.size.height })
        setInitialImagePosition({ x: image.position.x, y: image.position.y })

        if (previewRef.current) {
            const rect = previewRef.current.getBoundingClientRect()
            setInitialPosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            })
        }
    }

    const handleResize = (e: React.MouseEvent) => {
        if (!resizingImage || !previewRef.current) return

        const image = images.find(img => img.id === resizingImage.id)
        if (!image) return

        const rect = previewRef.current.getBoundingClientRect()
        const currentX = e.clientX - rect.left
        const currentY = e.clientY - rect.top

        // Calculate delta movement
        const deltaX = currentX - initialPosition.x
        const deltaY = currentY - initialPosition.y

        let newWidth = initialSize.width
        let newHeight = initialSize.height
        let positionOffset = { x: 0, y: 0 }

        // Calculate how much position needs to be adjusted to maintain center alignment
        // This is a key fix to prevent gaps when resizing
        switch (resizingImage.handle) {
            case 'nw':
                newWidth = Math.max(50, initialSize.width - deltaX)
                newHeight = Math.max(50, initialSize.height - deltaY)
                positionOffset.x = (initialSize.width - newWidth) / (2 * rect.width) * 100
                positionOffset.y = (initialSize.height - newHeight) / (2 * rect.height) * 100
                break
            case 'ne':
                newWidth = Math.max(50, initialSize.width + deltaX)
                newHeight = Math.max(50, initialSize.height - deltaY)
                positionOffset.x = (newWidth - initialSize.width) / (2 * rect.width) * 100
                positionOffset.y = (initialSize.height - newHeight) / (2 * rect.height) * 100
                break
            case 'sw':
                newWidth = Math.max(50, initialSize.width - deltaX)
                newHeight = Math.max(50, initialSize.height + deltaY)
                positionOffset.x = (initialSize.width - newWidth) / (2 * rect.width) * 100
                positionOffset.y = (newHeight - initialSize.height) / (2 * rect.height) * 100
                break
            case 'se':
                newWidth = Math.max(50, initialSize.width + deltaX)
                newHeight = Math.max(50, initialSize.height + deltaY)
                positionOffset.x = (newWidth - initialSize.width) / (2 * rect.width) * 100
                positionOffset.y = (newHeight - initialSize.height) / (2 * rect.height) * 100
                break
        }

        // Calculate new position to maintain proper alignment
        const newX = initialImagePosition.x + positionOffset.x
        const newY = initialImagePosition.y + positionOffset.y

        // Update both size and position to maintain center alignment
        dispatch(updateImageOverlay({
            id: resizingImage.id,
            size: { width: newWidth, height: newHeight },
            position: { x: newX, y: newY }
        }))
    }

    const handleResizeEnd = () => {
        setResizingImage(null)
    }

    const activeSubtitles = subtitles.filter(
        (subtitle) => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime,
    )

    const activeImages = images.filter((image) => currentTime >= image.startTime && currentTime <= image.endTime)

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center">
            <div
                ref={previewRef}
                className="relative flex h-[52vh] bg-black rounded-lg overflow-hidden items-center justify-center"
                onMouseMove={(e) => {
                    if (draggedElement) handleDrag(e)
                    if (resizingImage) handleResize(e)
                }}
                onMouseUp={() => {
                    handleDragEnd()
                    handleResizeEnd()
                }}
                onMouseLeave={() => {
                    handleDragEnd()
                    handleResizeEnd()
                }}
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

                        {/* Subtitle Overlays */}
                        {activeSubtitles.map((subtitle) => (
                            <SubtitleOverlay
                                key={subtitle.id}
                                subtitle={subtitle}
                                onDragStart={handleDragStart}
                            />
                        ))}

                        {/* Image Overlays */}
                        {activeImages.map((image) => (
                            <ImageOverlay
                                key={image.id}
                                image={image}
                                isDragging={draggedElement?.id === image.id && draggedElement.type === 'image'}
                                isSelected={draggedElement?.id === image.id || resizingImage?.id === image.id}
                                onDragStart={handleDragStart}
                                onResizeStart={handleResizeStart}
                            />
                        ))}

                        {/* Video Controls */}
                        <VideoControls
                            currentTime={currentTime}
                            duration={duration}
                            isPlaying={isPlaying}
                            volume={volume}
                            isMuted={isMuted}
                            onPlayPause={handlePlayPause}
                            onSkipBack={handleSkipBack}
                            onSkipForward={handleSkipForward}
                            onVolumeChange={handleVolumeChange}
                            onToggleMute={toggleMute}
                            onFullscreen={handleFullscreen}
                        />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full w-[70vh] text-white">
                        <p>Upload a video to preview</p>
                    </div>
                )}
            </div>
        </div>
    )
}
