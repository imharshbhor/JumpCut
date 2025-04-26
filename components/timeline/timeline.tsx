"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { setCurrentTime, setIsPlaying } from "@/lib/store/slices/timelineSlice"
import { setSnapshots } from "@/lib/store/slices/videoSlice"
import { v4 as uuidv4 } from "uuid"
import { store } from "@/lib/store/store"

// Import our components and hooks
import Playhead from "./playhead"
import TimelineControls from "./timeline-controls"
import TimelineMarkers from "./timeline-markers"
import VideoTrack from "./video-track"
import AudioTrack from "./audio-track"
import { useDragLogic } from "@/hooks/useDragLogic"
import { useSplitAndSnap } from "@/hooks/useSplitAndSnap"
import { TimelineSection, AudioSection, VideoSnapshot } from "@/lib/types/timeline"

export default function Timeline() {
    const dispatch = useAppDispatch()
    const { currentTime, isPlaying, zoom } = useAppSelector((state) => state.timeline)
    const { duration, snapshots, videos } = useAppSelector((state) => state.video)
    const timelineRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    // State for sections
    const [sections, setSections] = useState<TimelineSection[]>([])
    const [audioSections, setAudioSections] = useState<AudioSection[]>([])
    const [showAudioTrack] = useState(true)

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
    const handleTimelineClick = (e: React.MouseEvent) => {
        if (!timelineRef.current) return;
        const time = getTimeFromMousePosition(e.clientX);
        dispatch(setCurrentTime(time));
    };

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

    // Handle section movement - update snapshots
    const handleSectionMove = (sectionId: string, oldStartTime: number, oldEndTime: number, newStartTime: number, newEndTime: number) => {
        if (!snapshots || !Array.isArray(snapshots) || snapshots.length === 0) return;

        // Calculate the time shift
        const timeShift = newStartTime - oldStartTime;

        // Update snapshots that were within this section
        const updatedSnapshots = (snapshots as VideoSnapshot[]).map(snapshot => {
            // If snapshot was in the original section bounds, move it with the section
            if (snapshot.time >= oldStartTime && snapshot.time <= oldEndTime) {
                return {
                    ...snapshot,
                    time: snapshot.time + timeShift
                };
            }
            return snapshot;
        });

        // Update the snapshots in the store
        dispatch(setSnapshots(updatedSnapshots));
    };

    // Initialize drag logic
    const {
        activeDragId,
        handleDragStart
    } = useDragLogic(
        sections,
        setSections,
        audioSections,
        setAudioSections,
        duration,
        undefined,
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
        currentTime,
        undefined // No saveToHistory function needed
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
        }
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
    };

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when user is typing in an input/textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Split at playhead: S
            if (e.key === 's' && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
                e.preventDefault();
                handleSplitAtPlayhead();
            }

            // Zoom in: + or =
            if (e.key === '+' || e.key === '=' || e.key === 'NumpadAdd') {
                e.preventDefault();
                dispatch({ type: 'timeline/setZoom', payload: Math.min(zoom + 0.2, 2) });
            }

            // Zoom out: - or _
            if (e.key === '-' || e.key === '_' || e.key === 'NumpadSubtract') {
                e.preventDefault();
                dispatch({ type: 'timeline/setZoom', payload: Math.max(zoom - 0.2, 0.5) });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSplitAtPlayhead, zoom, dispatch]);

    return (
        <div className="w-full">
            {/* Timeline Controls */}
            <div className="mb-2">
                <TimelineControls
                    onSplitAtPlayhead={handleSplitAtPlayhead}
                />
            </div>

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
                        onRemoveSection={handleRemoveSection}
                        activeDragId={activeDragId}
                    />

                    {/* Audio Track */}
                    <AudioTrack
                        audioSections={audioSections}
                        duration={duration}
                        onDragStart={handleDragStart}
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
