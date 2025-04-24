"use client"

interface AudioWaveformProps {
  waveform: number[]
  isMuted?: boolean
}

export default function AudioWaveform({ waveform, isMuted = false }: AudioWaveformProps) {
  return (
    <div className="waveform-container">
      {waveform.map((value, index) => (
        <div
          key={index}
          className="waveform-bar"
          style={{
            left: `${(index / waveform.length) * 100}%`,
            height: `${value * 100}%`,
            opacity: isMuted ? 0.4 : 1,
          }}
        />
      ))}
    </div>
  )
}
