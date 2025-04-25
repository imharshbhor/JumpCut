"use client"

import { Trash2 } from "lucide-react"
import { TimelineSection, VideoSnapshot } from "../../lib/types/timeline"

interface VideoTrackProps {
    sections: TimelineSection[]
    snapshots: VideoSnapshot[] | undefined | null
    duration: number
    onDragStart: (e: React.MouseEvent | React.TouchEvent, sectionId: string) => void
    onResizeStart: (e: React.MouseEvent, sectionId: string, side: 'left' | 'right') => void
    onRemoveSection: (sectionId: string) => void
    activeDragId: string | null
}

export default function VideoTrack({
    sections,
    snapshots,
    duration,
    onDragStart,
    onResizeStart,
    onRemoveSection,
    activeDragId
}: VideoTrackProps) {
    return (
        <div className="relative w-full h-20 rounded overflow-hidden mb-1">
            {/* Background snapshot layer */}
            <div className="absolute inset-0 bg-black/70 flex items-stretch">
                {snapshots && snapshots.map((snapshot, index, arr) => {
                    const startPercent = (snapshot.time / duration) * 100;
                    const nextSnapshot = arr[index + 1];
                    const endPercent = nextSnapshot
                        ? (nextSnapshot.time / duration) * 100
                        : 100;
                    const width = endPercent - startPercent;

                    return (
                        <div
                            key={snapshot.time}
                            className="h-full opacity-30 absolute top-0 bottom-0"
                            style={{
                                left: `${startPercent}%`,
                                width: `${width}%`,
                                backgroundImage: snapshot.url ? `url(${snapshot.url})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        />
                    );
                })}
            </div>

            {/* Video sections */}
            {sections.map((section) => (
                <VideoSection
                    key={section.id}
                    section={section}
                    duration={duration}
                    onDragStart={(e) => onDragStart(e, section.id)}
                    onResizeStart={onResizeStart}
                    onRemove={() => onRemoveSection(section.id)}
                    isBeingDragged={activeDragId === section.id}
                />
            ))}

            {/* Empty state */}
            {sections.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <p className="text-sm">No video clips added</p>
                </div>
            )}
        </div>
    )
}

function VideoSection({
    section,
    duration,
    onDragStart,
    onResizeStart,
    onRemove,
    isBeingDragged
}: {
    section: TimelineSection
    duration: number
    onDragStart: (e: React.MouseEvent | React.TouchEvent) => void
    onResizeStart: (e: React.MouseEvent, sectionId: string, side: 'left' | 'right') => void
    onRemove: () => void
    isBeingDragged: boolean
}) {
    // Calculate section position and width as percentages
    const left = (section.startTime / duration) * 100
    const width = ((section.endTime - section.startTime) / duration) * 100

    // Handle mouse down on section (for dragging)
    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent if clicking on a handle or the delete button
        if (
            (e.target as HTMLElement).classList.contains('resize-handle') ||
            (e.target as HTMLElement).classList.contains('delete-button') ||
            (e.target as HTMLElement).closest('.delete-button')
        ) {
            return
        }
        onDragStart(e)
    }

    return (
        <div
            className={`absolute top-0 h-full bg-purple-700/10 border-x-[12px] border-y-4 border-purple-500 rounded cursor-move flex items-center ${isBeingDragged ? 'ring-2 ring-white z-10' : ''
                }`}
            style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundImage: section.thumbnail ? `url(${section.thumbnail})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={onDragStart}
        >

            {/* Delete button */}
            <button
                className="delete-button absolute -top-0 -right-0 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100"
                onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                }}
            >
                <Trash2 size={12} />
            </button>

            {/* Section duration */}
            <span className="text-xs text-white font-mono px-3 py-1 bg-black/50 rounded absolute bottom-1 left-1/2 transform -translate-x-1/2">
                {section.endTime - section.startTime >= 60
                    ? `${Math.floor((section.endTime - section.startTime) / 60)}m ${((section.endTime - section.startTime) % 60).toFixed(1)}s`
                    : `${(section.endTime - section.startTime).toFixed(1)}s`
                }
            </span>
        </div>
    )
}
