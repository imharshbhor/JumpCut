"use client"

import { useRef } from "react"

interface AudioWaveformProps {
    waveform: number[]
    isMuted?: boolean
    color?: string
}

export default function AudioWaveform({
    waveform,
    isMuted = false,
    color = "#3b82f6"
}: AudioWaveformProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            className="h-full w-full relative"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
            }}
        >
            {waveform.map((value, index) => {
                // Scale the value between 20% and 70% to avoid tiny bars
                const scaledValue = 0 + (value * 0.6);

                return (
                    <div
                        key={index}
                        style={{
                            flex: 1,
                            minWidth: "1px",
                            maxWidth: "25px",
                            height: `${scaledValue * 100}%`,
                            backgroundColor: color,
                            opacity: isMuted ? 0.4 : 0.7,
                            borderRadius: "1px",
                            transition: "height 0.1s ease"
                        }}
                    />
                );
            })}
        </div>
    )
}
