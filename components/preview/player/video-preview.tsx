"use client"

import { useRef, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { setCurrentTime, setIsPlaying } from "@/lib/store/slices/timelineSlice"
import { updateSubtitle } from "@/lib/store/slices/subtitleSlice"
import { updateImageOverlay } from "@/lib/store/slices/overlaySlice"
import VideoControls from "./video-controls"
import ImageOverlay from "./images-overlay"
import SubtitleOverlay from "./subtitles-overlay"
import VideoPlayer from "./video-player"

export default function VideoPreview() {
    const dispatch = useAppDispatch()
    const previewRef = useRef<HTMLDivElement>(null)
    const { videoUrl, duration } = useAppSelector((state) => state.video)
    const { currentTime, isPlaying } = useAppSelector((state) => state.timeline)
    const { subtitles } = useAppSelector((state) => state.subtitle)
    const { images } = useAppSelector((state) => state.overlay)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [draggedElement, setDraggedElement] = useState<{ id: string, type: 'subtitle' | 'image' | 'text' } | null>(null)
    const [resizingImage, setResizingImage] = useState<{ id: string, handle: string } | null>(null)
    const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 })
    const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
    const [initialImagePosition, setInitialImagePosition] = useState({ x: 0, y: 0 })

    const handleTimeUpdate = () => {
        if (document.querySelector('video') && !isNaN(document.querySelector('video')!.currentTime)) {
            dispatch(setCurrentTime(document.querySelector('video')!.currentTime))
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

        const deltaX = currentX - initialPosition.x
        const deltaY = currentY - initialPosition.y

        let newWidth = initialSize.width
        let newHeight = initialSize.height
        let positionOffset = { x: 0, y: 0 }

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

        const newX = initialImagePosition.x + positionOffset.x
        const newY = initialImagePosition.y + positionOffset.y

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
                <VideoPlayer
                    videoUrl={videoUrl}
                    currentTime={currentTime}
                    isPlaying={isPlaying}
                    volume={volume}
                    isMuted={isMuted}
                    onTimeUpdate={handleTimeUpdate}
                />

                {videoUrl && (
                    <>
                        {activeSubtitles.map((subtitle) => (
                            <SubtitleOverlay
                                key={subtitle.id}
                                subtitle={subtitle}
                                onDragStart={handleDragStart}
                            />
                        ))}

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
                )}
            </div>
        </div>
    )
}
