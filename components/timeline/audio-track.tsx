"use client"

import { Trash2, Volume2 } from "lucide-react"
import { AudioSection } from "../../lib/types/timeline"

interface AudioTrackProps {
    audioSections: AudioSection[]
    duration: number
    onDragStart: (e: React.MouseEvent | React.TouchEvent, sectionId: string) => void
    onResizeStart: (e: React.MouseEvent, sectionId: string, side: 'left' | 'right') => void
    onRemoveSection: (sectionId: string) => void
    activeDragId: string | null
}

export default function AudioTrack({
    audioSections,
    duration,
    onDragStart,
    onResizeStart,
    onRemoveSection,
    activeDragId
}: AudioTrackProps) {
    return (
        <div className="relative w-full h-16 rounded overflow-hidden">
            {/* Audio sections */}
            {audioSections.map((section) => (
                <AudioSection
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
            {audioSections.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <p className="text-sm">No audio clips added</p>
                </div>
            )}
        </div>
    )
}

function AudioSection({
    section,
    duration,
    onDragStart,
    onResizeStart,
    onRemove,
    isBeingDragged
}: {
    section: AudioSection
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

    // Generate audio waveform display
    const renderWaveform = () => {
        if (!section.waveform?.data || section.waveform.data.length === 0) {
            return null;
        }

        return (
            <div className="absolute inset-0 flex items-center justify-around">
                {section.waveform.data.map((value, index) => (
                    <div
                        key={index}
                        className="bg-green-400 w-[1px] mx-[0.5px]"
                        style={{ height: `${value * 70}%` }}
                    />
                ))}
            </div>
        );
    };

    return (
        <div
            className={`absolute top-0 h-full bg-green-800/90 border-x-[12px] border-y-4 border-green-500 rounded cursor-move flex items-center ${isBeingDragged ? 'ring-2 ring-white z-10' : ''
                }`}
            style={{
                left: `${left}%`,
                width: `${width}%`
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={onDragStart}
        >
            {/* Waveform visualization */}
            {renderWaveform()}

            {/* Delete button */}
            <button
                className="delete-button absolute -top-0 -right-0 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 z-10"
                onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                }}
            >
                <Trash2 size={12} />
            </button>

            {/* Audio icon */}
            <Volume2
                className="absolute left-2 top-2 text-white/80 z-10"
                size={14}
            />

            {/* Section duration */}
            <span className="text-xs text-white font-mono px-2 py-1 bg-black/50 rounded absolute bottom-1 left-1/2 transform -translate-x-1/2 z-10">
                {((section.endTime - section.startTime).toFixed(1))}s
            </span>
        </div>
    )
}
