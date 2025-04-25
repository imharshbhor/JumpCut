"use client"

import { useRef, useEffect } from "react"

interface AudioWaveformProps {
    waveform: number[]
    width?: number
    height?: number
    isActive?: boolean
    isMuted?: boolean
    progress?: number
}

export default function AudioWaveform({
    waveform,
    width = 350,
    height = 40,
    isActive = true,
    isMuted = false,
    progress = 0
}: AudioWaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !waveform.length) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        // Clear canvas
        ctx.clearRect(0, 0, width, height)

        // Determine colors based on state
        const barColor = isMuted
            ? 'rgba(100, 100, 100, 0.4)'
            : isActive
                ? 'rgba(96, 165, 250, 0.8)'
                : 'rgba(100, 100, 100, 0.8)'

        const progressColor = isMuted
            ? 'rgba(100, 100, 100, 0.6)'
            : 'rgba(59, 130, 246, 1)'

        // Calculate bar width and spacing
        const numBars = waveform.length
        const barWidth = width / numBars - 1
        const barSpacing = 1

        // Draw waveform bars
        for (let i = 0; i < numBars; i++) {
            const x = i * (barWidth + barSpacing)
            const barHeight = (waveform[i] / 255) * height
            const y = (height - barHeight) / 2

            // Determine if this bar is within progress
            const isInProgress = (i / numBars) <= progress

            ctx.fillStyle = isInProgress ? progressColor : barColor
            ctx.fillRect(x, y, barWidth, barHeight)
        }
    }, [waveform, width, height, isActive, isMuted, progress])

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                opacity: isMuted ? 0.6 : 1
            }}
            className="rounded-sm"
        />
    )
}
