"use client"

import { useRef, useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { setCurrentTime, setIsPlaying } from "@/lib/store/slices/timelineSlice"
import { formatTime, generateWaveform } from "@/lib/utils/video-utils"
import {
    Play, Pause, ZoomIn, Music, ScissorsLineDashed,
    ChevronLeft, ChevronRight, ZoomOut as ZoomOutIcon,
    Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { store } from "@/lib/store/store"
import AudioWaveform from "../audio/audio-waveform"
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    useDraggable,
    useDroppable,
    pointerWithin,
    closestCenter
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

interface TimelineSection {
    id: string;
    startTime: number;
    endTime: number;
    videoId?: string;
    thumbnail?: string;
}

interface VideoSnapshot {
    time: number;
    url: string;
}

export default function Timeline() {
    const dispatch = useAppDispatch()
    const { currentTime, isPlaying, zoom } = useAppSelector((state) => state.timeline)
    const { duration, snapshots, videos } = useAppSelector((state) => state.video)
    const timelineRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const playheadDraggingRef = useRef(false)
    const waveform = generateWaveform(duration)
    const [sections, setSections] = useState<TimelineSection[]>([])
    const [sectionStartTime, setSectionStartTime] = useState<number | null>(null)
    const [activeDragId, setActiveDragId] = useState<string | null>(null)
    const [isDraggingVideo, setIsDraggingVideo] = useState(false)

    const timeMarkers = Array.from({ length: Math.ceil(duration / 20) + 1 }, (_, i) => i * 20)

    useEffect(() => {
        const videoElement = document.querySelector("video") as HTMLVideoElement
        if (videoElement) videoRef.current = videoElement
    }, [duration])

    useEffect(() => {
        if (!isPlaying) return

        let lastTimestamp = performance.now()
        let animationFrameId: number

        const updateTime = (timestamp: number) => {
            if (!isPlaying) return

            const delta = (timestamp - lastTimestamp) / 1000
            lastTimestamp = timestamp

            const curr = store.getState().timeline.currentTime
            const next = curr + delta

            if (next >= duration) {
                dispatch(setCurrentTime(0))
                dispatch(setIsPlaying(false))
            } else {
                dispatch(setCurrentTime(next))
            }

            animationFrameId = requestAnimationFrame(updateTime)
        }

        animationFrameId = requestAnimationFrame(updateTime)
        return () => cancelAnimationFrame(animationFrameId)
    }, [isPlaying, duration, dispatch])

    useEffect(() => {
        const video = videoRef.current
        if (video) {
            if (Math.abs(video.currentTime - currentTime) > 0.1) video.currentTime = currentTime
            if (isPlaying && video.paused) video.play()
            else if (!isPlaying && !video.paused) video.pause()
        }

        // Only scroll the timeline if we're not currently dragging the playhead
        if (timelineRef.current && !playheadDraggingRef.current) {
            const timeline = timelineRef.current
            const scrollX = (currentTime / duration) * timeline.scrollWidth
            const viewportCenter = timeline.clientWidth / 2

            // Only scroll if the playhead is outside the middle 50% of the viewport
            const currentPlayheadPos = scrollX - timeline.scrollLeft
            const buffer = timeline.clientWidth * 0.25

            if (currentPlayheadPos < viewportCenter - buffer || currentPlayheadPos > viewportCenter + buffer) {
                timeline.scrollTo({
                    left: scrollX - viewportCenter,
                    behavior: "smooth"
                })
            }
        }
    }, [currentTime, isPlaying, duration])

    const handlePlayPause = () => dispatch(setIsPlaying(!isPlaying))

    const handleSkipBack = () => {
        const newTime = Math.max(0, currentTime - 5)
        if (videoRef.current) videoRef.current.currentTime = newTime
        dispatch(setCurrentTime(newTime))
    }

    const handleSkipForward = () => {
        const newTime = Math.min(duration, currentTime + 5)
        if (videoRef.current) videoRef.current.currentTime = newTime
        dispatch(setCurrentTime(newTime))
    }

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = timelineRef.current?.getBoundingClientRect()
        if (!rect) return
        const offsetX = e.clientX - rect.left + (timelineRef.current?.scrollLeft || 0)
        const totalWidth = timelineRef.current?.scrollWidth || rect.width
        const percentage = offsetX / totalWidth
        const newTime = percentage * duration
        dispatch(setCurrentTime(Math.max(0, Math.min(newTime, duration))))
    }

    const handleZoomIn = () => dispatch({ type: "timeline/setZoom", payload: Math.min(zoom + 0.2, 2) })
    const handleZoomOut = () => dispatch({ type: "timeline/setZoom", payload: Math.max(zoom - 0.2, 0.5) })

    const handlePlayheadDrag = (e: MouseEvent) => {
        if (!playheadDraggingRef.current) return

        const rect = timelineRef.current?.getBoundingClientRect()
        if (!rect) return

        const totalWidth = timelineRef.current?.scrollWidth || rect.width
        const offsetX = e.clientX - rect.left + (timelineRef.current?.scrollLeft || 0)
        const percentage = offsetX / totalWidth
        const newTime = percentage * duration

        dispatch(setCurrentTime(Math.min(Math.max(newTime, 0), duration)))
    }

    const handlePlayheadDragStart = (e: React.MouseEvent) => {
        e.preventDefault()
        playheadDraggingRef.current = true

        const handleMouseMove = (e: MouseEvent) => handlePlayheadDrag(e)

        const handleMouseUp = () => {
            playheadDraggingRef.current = false
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mouseup", handleMouseUp)
    }

    const handleMarkSectionStart = () => {
        setSectionStartTime(currentTime)
    }

    const handleMarkSectionEnd = () => {
        if (sectionStartTime !== null) {
            // Ensure start time is before end time
            const startTime = Math.min(sectionStartTime, currentTime)
            const endTime = Math.max(sectionStartTime, currentTime)

            const newSection: TimelineSection = {
                id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                startTime,
                endTime
            }

            setSections([...sections, newSection])
            setSectionStartTime(null)
        }
    }

    const handleSplitAtPlayhead = () => {
        if (sections.length === 0) {
            // If no sections exist and a video is loaded, create a section for the entire video
            if (duration > 0) {
                const newSection: TimelineSection = {
                    id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    startTime: 0,
                    endTime: duration
                }
                setSections([newSection])
            }
            return
        }

        // Find any sections that contain the current playhead position
        const sectionsToSplit = sections.filter(
            section => currentTime > section.startTime && currentTime < section.endTime
        )

        if (sectionsToSplit.length > 0) {
            const newSections = [...sections]

            // For each section that contains the playhead, split it into two
            sectionsToSplit.forEach(section => {
                const sectionIndex = newSections.findIndex(s => s.id === section.id)
                if (sectionIndex !== -1) {
                    // Remove the original section
                    newSections.splice(sectionIndex, 1)

                    // Create two new sections
                    const leftSection: TimelineSection = {
                        id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-left`,
                        startTime: section.startTime,
                        endTime: currentTime,
                        videoId: section.videoId,
                        thumbnail: section.thumbnail
                    }

                    const rightSection: TimelineSection = {
                        id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-right`,
                        startTime: currentTime,
                        endTime: section.endTime,
                        videoId: section.videoId,
                        thumbnail: section.thumbnail
                    }

                    // Insert the new sections where the original section was
                    newSections.splice(sectionIndex, 0, leftSection, rightSection)
                }
            })

            setSections(newSections)
        }
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveDragId(active.id as string)

        // Check if we're dragging a video from the media panel
        if (active.data.current?.type === 'video') {
            setIsDraggingVideo(true)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        setActiveDragId(null)
        setIsDraggingVideo(false)

        // Handle dragging a video from the media panel to the timeline
        if (active.data.current?.type === 'video' && over?.id === 'timeline-drop-area') {
            const videoId = active.id as string
            const video = videos.find(v => v.id === videoId)

            if (video) {
                const newSection: TimelineSection = {
                    id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    startTime: 0,
                    endTime: video.duration || 30, // Default to 30 seconds if duration is unknown
                    videoId: video.id,
                    thumbnail: video.thumbnail
                }

                setSections([...sections, newSection])
            }
            return
        }

        // Handle reordering sections within the timeline
        if (over && active.id !== over.id) {
            setSections(prevSections => {
                const activeSectionIndex = prevSections.findIndex(section => section.id === active.id)
                const overSectionIndex = prevSections.findIndex(section => section.id === over.id)

                if (activeSectionIndex !== -1 && overSectionIndex !== -1) {
                    const newSections = [...prevSections]
                    const [draggedSection] = newSections.splice(activeSectionIndex, 1)
                    newSections.splice(overSectionIndex, 0, draggedSection)
                    return newSections
                }

                return prevSections
            })
        }
    }

    const handleRemoveSection = (sectionId: string) => {
        setSections(sections.filter(section => section.id !== sectionId))
    }

    const TimelineDropArea = () => {
        const { isOver, setNodeRef } = useDroppable({
            id: 'timeline-drop-area',
        })

        return (
            <div
                ref={setNodeRef}
                className={`flex relative h-24 border-b ${isOver && isDraggingVideo ? 'bg-blue-50' : 'bg-gray-100'}`}
                onClick={handleTimelineClick}
            >
                <div className="flex-1 relative h-full overflow-hidden">
                    {snapshots?.map((snapshot: VideoSnapshot, index: number) => (
                        <div
                            key={`thumb-${index}`}
                            className="absolute top-0 h-full pointer-events-none"
                            style={{
                                left: `${(snapshot.time / duration) * 100}%`,
                                width: `${100 / (snapshots?.length || 1)}%`
                            }}
                        >
                            <img
                                src={snapshot.url}
                                alt={`Thumbnail at ${formatTime(snapshot.time)}`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ))}

                    {sections.map((section) => (
                        <DraggableSection
                            key={section.id}
                            section={section}
                            duration={duration}
                            onRemove={() => handleRemoveSection(section.id)}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
        >
            <div className="w-full timeline-container bg-white border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSkipBack}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePlayPause}>
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSkipForward}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-mono ml-2">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
                            <ZoomOutIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-row">
                    <div className="flex flex-col justify-end gap-6 mb-1 w-12 bg-white border-r">
                        {/* <div className="h-12 flex items-center justify-center"><Type className="text-gray-500" /></div> */}
                        <div className="h-16 flex items-center justify-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleSplitAtPlayhead}
                            >
                                <ScissorsLineDashed size={24} className={sectionStartTime !== null ? "text-blue-500" : "text-gray-500"} />
                            </Button>
                        </div>
                        <div className="h-16 flex items-center justify-center"><Music size={20} className="text-gray-500" /></div>
                    </div>

                    <div className="overflow-x-auto flex-1 relative" ref={timelineRef}>
                        <div className="relative" style={{ width: `${zoom * 1000}px` }}>
                            <div className="flex w-full h-8 border-b relative">
                                {timeMarkers.map((time) => (
                                    <div
                                        key={`marker-${time}`}
                                        className="absolute flex flex-col items-center pointer-events-none"
                                        style={{ left: `${(time / duration) * 100}%` }}
                                    >
                                        <div className="h-2 w-px bg-gray-300"></div>
                                        <span className="text-xs text-gray-500">{formatTime(time)}</span>
                                    </div>
                                ))}
                            </div>

                            <div
                                className="absolute top-0 bottom-0 w-[5px] bg-black border border-white z-10 cursor-pointer"
                                style={{ left: `${(currentTime / duration) * 100}%` }}
                                onMouseDown={handlePlayheadDragStart}
                            >
                                <div className="w-4 h-4 z-10 rounded-full bg-black border border-white -ml-[0.40rem] flex items-center justify-center">
                                </div>
                            </div>

                            {sectionStartTime !== null && (
                                <div
                                    className="absolute top-0 bottom-0 w-[3px] bg-blue-500 border border-white z-5"
                                    style={{ left: `${(sectionStartTime / duration) * 100}%` }}
                                >
                                    <div className="w-3 h-3 z-5 rounded-full bg-blue-500 border border-white -ml-[0.35rem] -mt-1"></div>
                                </div>
                            )}

                            <div className="flex flex-col">
                                <TimelineDropArea />

                                <div className="flex items-center h-16 relative bg-gray-50">
                                    <AudioWaveform waveform={waveform} isMuted={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeDragId && isDraggingVideo && (
                    <div className="w-24 h-16 bg-blue-100 border-2 border-blue-500 rounded-md opacity-70 flex items-center justify-center">
                        <p className="text-xs text-center">Add to timeline</p>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    )
}

function DraggableSection({ section, duration, onRemove }: { section: TimelineSection, duration: number, onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: section.id,
    })

    const style = {
        position: 'absolute' as const,
        left: `${(section.startTime / duration) * 100}%`,
        width: `${((section.endTime - section.startTime) / duration) * 100}%`,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 20 : 5,
    }

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="absolute top-0 h-full bg-blue-500 bg-opacity-30 border-2 border-blue-500 cursor-move group"
            style={style}
        >
            {section.thumbnail && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img
                        src={section.thumbnail}
                        alt="Section thumbnail"
                        className="w-full h-full object-cover opacity-50"
                    />
                </div>
            )}
            <div className="absolute top-0 right-0 bottom-0 w-2 bg-blue-600 cursor-ew-resize"></div>
            <div className="absolute top-0 left-0 bottom-0 w-2 bg-blue-600 cursor-ew-resize"></div>
            <Button
                variant="destructive"
                size="icon"
                className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
            >
                <Trash2 className="h-3 w-3" />
            </Button>
            <div className="absolute bottom-1 left-1 right-1 text-xs bg-white bg-opacity-70 px-1 rounded">
                {formatTime(section.startTime)} - {formatTime(section.endTime)}
            </div>
        </div>
    )
}
