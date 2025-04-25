"use client"

import { useRef, useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { setCurrentTime, setIsPlaying } from "@/lib/store/slices/timelineSlice"
import { v4 as uuidv4 } from "uuid"
import { store } from "@/lib/store/store"

// Import our new components and hooks
import Playhead from "./playhead"
import TimelineControls from "./timeline-controls"
import TimelineMarkers from "./timeline-markers"
import VideoTrack from "./video-track"
import AudioTrack from "./audio-track"
import { useDragLogic } from "../../hooks/useDragLogic"
import { useResizeLogic } from "../../hooks/useResizeLogic"
import { useSnapLogic } from "../../hooks/useSnapLogic"
import { useSplitAndSnap } from "../../hooks/useSplitAndSnap"
import { TimelineSection, AudioSection } from "../../lib/types/timeline"

export default function Timeline() {
    const dispatch = useAppDispatch()
    const { currentTime, isPlaying, zoom } = useAppSelector((state) => state.timeline)
    const { duration, snapshots, videos } = useAppSelector((state) => state.video)
    const timelineRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    // State for sections
    const [sections, setSections] = useState<TimelineSection[]>([])
    const [audioSections, setAudioSections] = useState<AudioSection[]>([])
    const [showAudioTrack, setShowAudioTrack] = useState(true)

    // Create an initial section if none exists and we have a video loaded
    useEffect(() => {
        if (sections.length === 0 && duration > 0) {
            const newSectionId = uuidv4();

            // Create a video section for the entire duration
            const newSection: TimelineSection = {
                id: newSectionId,
                startTime: 0,
                endTime: duration,
                waveform: {
                    startTime: 0,
                    endTime: duration,
                    data: Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2)
                },
                isLinkedToAudio: true,
                linkedAudioId: `audio-${newSectionId}`,
                thumbnail: undefined
            };

            // Create matching audio section
            const newAudioSection: AudioSection = {
                id: `audio-${newSectionId}`,
                startTime: 0,
                endTime: duration,
                waveform: {
                    startTime: 0,
                    endTime: duration,
                    data: Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2)
                },
                isLinkedToVideo: true,
                linkedVideoId: newSectionId
            };

            // Add the new sections
            setSections([newSection]);
            setAudioSections([newAudioSection]);
        }
    }, [duration, sections.length, snapshots]);

    // Get time from mouse position helper function
    const getTimeFromMousePosition = (clientX: number): number => {
        const timelineEl = timelineRef.current;
        if (!timelineEl) return 0;

        const rect = timelineEl.getBoundingClientRect();
        const offsetX = clientX - rect.left + timelineEl.scrollLeft;
        const scrollableWidth = timelineEl.scrollWidth;
        const relativeX = offsetX / scrollableWidth;

        return relativeX * duration;
      };

    // Initialize video refs
    useEffect(() => {
        const videoElement = document.querySelector("video") as HTMLVideoElement
        if (videoElement) videoRef.current = videoElement
    }, [duration])

    // Playback loop
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

    // Sync video element with timeline
    useEffect(() => {
        const video = videoRef.current
        if (video) {
            if (Math.abs(video.currentTime - currentTime) > 0.1) video.currentTime = currentTime
            if (isPlaying && video.paused) video.play()
            else if (!isPlaying && !video.paused) video.pause()
        }
    }, [currentTime, isPlaying])

    // Scroll timeline to keep playhead visible
    useEffect(() => {
        if (timelineRef.current) {
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
    }, [currentTime, duration])

    // Handle click on timeline to seek
    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const newTime = getTimeFromMousePosition(e.clientX)
        dispatch(setCurrentTime(Math.min(Math.max(newTime, 0), duration)))
    }

    // Skip back 5 seconds
    const handleSkipBack = () => {
        const newTime = Math.max(currentTime - 5, 0)
        dispatch(setCurrentTime(newTime))
    }

    // Skip forward 5 seconds
    const handleSkipForward = () => {
        const newTime = Math.min(currentTime + 5, duration)
        dispatch(setCurrentTime(newTime))
    }

    // Initialize drag logic
    const {
        activeDragId,
        isDraggingSection,
        currentDragSection,
        handleDragStart
    } = useDragLogic(
        sections,
        setSections,
        audioSections,
        setAudioSections,
        duration,
        snapshots || [],
        getTimeFromMousePosition
    )

    // Initialize resize logic
    const {
        isResizingSection,
        resizeSide,
        resizeSection,
        handleSectionResizeStart
    } = useResizeLogic(
        sections,
        setSections,
        audioSections,
        setAudioSections,
        duration,
        snapshots || [],
        getTimeFromMousePosition
    )

    // Initialize split and snap logic
    const {
        handleSplitAtPlayhead,
        generateSectionWaveform
    } = useSplitAndSnap(
        sections,
        setSections,
        audioSections,
        setAudioSections,
        currentTime
    )

    // Remove a section
    const handleRemoveSection = (sectionId: string) => {
        // Check if it's a video section
        const videoSection = sections.find(s => s.id === sectionId);
        if (videoSection) {
            // Remove the section
            setSections(prevSections => prevSections.filter(s => s.id !== sectionId));

            // If it has a linked audio section, remove that too
            if (videoSection.isLinkedToAudio && videoSection.linkedAudioId) {
                setAudioSections(prevAudioSections =>
                    prevAudioSections.filter(as => as.id !== videoSection.linkedAudioId)
                );
            }
        } else {
            // Must be an audio section
            const audioSection = audioSections.find(s => s.id === sectionId);
            if (audioSection) {
                setAudioSections(prevAudioSections =>
                    prevAudioSections.filter(as => as.id !== sectionId)
                );

                // If linked to video, update the video section to remove the link
                if (audioSection.isLinkedToVideo && audioSection.linkedVideoId) {
                    setSections(prevSections =>
                        prevSections.map(vs =>
                            vs.id === audioSection.linkedVideoId
                                ? { ...vs, isLinkedToAudio: false, linkedAudioId: undefined }
                                : vs
                        )
                    );
                }
            }
        }
    };

        return (
        <div className="w-full">
            {/* Timeline Controls */}
            <TimelineControls
                onSplitAtPlayhead={handleSplitAtPlayhead}
                showAudioTrack={showAudioTrack}
                setShowAudioTrack={setShowAudioTrack}
            />

            {/* Timeline */}
            <div
                ref={timelineRef}
                className="relative rounded-lg w-full overflow-x-auto bg-background"
                style={{ height: '186px' }}
                onClick={handleTimelineClick}
            >
                <div
                    className="relative h-full"
                    style={{ width: `${duration * 50 * zoom}px`, minWidth: '100%' }}
                >
                    {/* Time Markers */}
                    <TimelineMarkers duration={duration} zoom={zoom} />

                    {/* Video Track */}
                    <VideoTrack
                        sections={sections}
                        snapshots={snapshots}
                            duration={duration}
                        onDragStart={handleDragStart}
                            onResizeStart={handleSectionResizeStart}
                        onRemoveSection={handleRemoveSection}
                        activeDragId={activeDragId}
                    />

                    {/* Audio Track */}
                    <AudioTrack
                        audioSections={audioSections}
                        duration={duration}
            onDragStart={handleDragStart}
                        onResizeStart={handleSectionResizeStart}
                        onRemoveSection={handleRemoveSection}
                        activeDragId={activeDragId}
                    />

                    {/* Playhead */}
                    <Playhead
                        duration={duration}
                        getTimeFromMousePosition={getTimeFromMousePosition}
                    />
                </div>
            </div>
        </div>
    )
}
