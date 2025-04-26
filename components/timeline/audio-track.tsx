"use client"

import { Trash2, Volume2, VolumeX } from "lucide-react"
import type { AudioSection } from "@/lib/types/timeline"
import { useState, useMemo } from "react"

interface AudioTrackProps {
    audioSections: AudioSection[]
    duration: number
    onDragStart: (e: React.MouseEvent | React.TouchEvent, sectionId: string) => void
    onRemoveSection: (sectionId: string) => void
    activeDragId: string | null
}

export default function AudioTrack({
    audioSections,
    duration,
    onDragStart,
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
    onRemove,
    isBeingDragged
}: {
    section: AudioSection
    duration: number
    onDragStart: (e: React.MouseEvent | React.TouchEvent) => void
    onRemove: () => void
    isBeingDragged: boolean
}) {
    // Calculate section position and width as percentages
    const left = (section.startTime / duration) * 100
    const width = ((section.endTime - section.startTime) / duration) * 100
    const [isMuted, setIsMuted] = useState(false)

    // Handle mouse down on section (for dragging)
    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent if clicking on buttons
        if (
            (e.target as HTMLElement).classList.contains('delete-button') ||
            (e.target as HTMLElement).closest('.delete-button') ||
            (e.target as HTMLElement).classList.contains('mute-button') ||
            (e.target as HTMLElement).closest('.mute-button')
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
            <div className="absolute inset-0 flex items-center justify-center gap-1">
                {/* Repeat the waveform data mapping based on section size */}
                {section.waveform.data.map((value, index) => (
                    <div
                        key={index}
                        className={`${isMuted ? 'bg-gray-400' : 'bg-green-400'} w-[3px]`}
                        style={{ height: `${value * 50}%` }}
                    />
                ))}
                {/* For smaller sections, repeat once */}
                {section.endTime - section.startTime < 2 && section.waveform.data.map((value, index) => (
                    <div
                        key={`repeat1-${index}`}
                        className={`${isMuted ? 'bg-gray-400' : 'bg-green-400'} w-[3px]`}
                        style={{ height: `${value * 50}%` }}
                    />
                ))}
                {/* For medium sections, repeat twice */}
                {section.endTime - section.startTime >= 2 && section.endTime - section.startTime < 5 && (
                    <>
                        {section.waveform.data.map((value, index) => (
                            <div
                                key={`repeat1-${index}`}
                                className={`${isMuted ? 'bg-gray-400' : 'bg-green-400'} w-[3px]`}
                                style={{ height: `${value * 50}%` }}
                            />
                        ))}
                        {section.waveform.data.map((value, index) => (
                            <div
                                key={`repeat2-${index}`}
                                className={`${isMuted ? 'bg-gray-400' : 'bg-green-400'} w-[3px]`}
                                style={{ height: `${value * 50}%` }}
                            />
                        ))}
                    </>
                )}
                {/* For larger sections, repeat three times */}
                {section.endTime - section.startTime >= 5 && (
                    <>
                        {section.waveform.data.map((value, index) => (
                            <div
                                key={`repeat1-${index}`}
                                className={`${isMuted ? 'bg-gray-400' : 'bg-green-400'} w-[3px]`}
                                style={{ height: `${value * 50}%` }}
                            />
                        ))}
                        {section.waveform.data.map((value, index) => (
                            <div
                                key={`repeat2-${index}`}
                                className={`${isMuted ? 'bg-gray-400' : 'bg-green-400'} w-[3px]`}
                                style={{ height: `${value * 50}%` }}
                            />
                        ))}
                        {section.waveform.data.map((value, index) => (
                            <div
                                key={`repeat3-${index}`}
                                className={`${isMuted ? 'bg-gray-400' : 'bg-green-400'} w-[3px]`}
                                style={{ height: `${value * 50}%` }}
                            />
                        ))}
                    </>
                )}
            </div>
        );
    };

    const handleToggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
        console.log(`Toggle mute for section ${section.id}`);
        console.log(!isMuted);
    };

    return (
        <div
            className={`absolute top-0 h-full ${isMuted ? 'bg-gray-600/90 border-gray-500' : 'bg-green-800/90 border-green-500'} border-x-[12px] border-y-4 rounded cursor-move flex items-center ${isBeingDragged ? 'ring-2 ring-white z-10' : ''
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

            {/* Mute button */}
            <button
                className="mute-button absolute -top-0 right-6 bg-blue-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 z-10"
                onClick={handleToggleMute}
            >
                {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>

            {/* Audio icon */}
            {isMuted ? (
                <VolumeX
                    className="absolute left-2 top-2 text-white/80 z-10"
                    size={14}
                />
            ) : (
                <Volume2
                    className="absolute left-2 top-2 text-white/80 z-10"
                    size={14}
                />
            )}

            {/* Section duration */}
            <span className="text-xs text-white font-mono px-2 py-1 bg-black/50 rounded absolute bottom-1 left-1/2 transform -translate-x-1/2 z-10">
                {section.endTime - section.startTime >= 60
                    ? `${Math.floor((section.endTime - section.startTime) / 60)}m ${((section.endTime - section.startTime) % 60).toFixed(0)}s`
                    : `${(section.endTime - section.startTime).toFixed(1)}s`
                }
            </span>
        </div>
    )
}
