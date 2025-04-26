"use client"

interface SubtitleOverlayProps {
    subtitle: any 
    onDragStart: (e: React.MouseEvent, id: string, type: 'subtitle' | 'image' | 'text') => void
}

export default function SubtitleOverlay({
    subtitle,
    onDragStart
}: SubtitleOverlayProps) {
    return (
        <div
            key={subtitle.id}
            className="absolute cursor-move"
            style={{
                left: `${subtitle.position.x}%`,
                top: `${subtitle.position.y}%`,
                transform: "translate(-50%, -50%)",
                fontFamily: subtitle.style.fontFamily,
                fontSize: `${subtitle.style.fontSize}px`,
                color: subtitle.style.color,
                backgroundColor: `${subtitle.style.backgroundColor}${Math.round(subtitle.style.opacity * 255)
                    .toString(16)
                    .padStart(2, "0")}`,
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
                textAlign: subtitle.style.textAlign as "left" | "center" | "right" | undefined || "center",
                maxWidth: "80%",
                zIndex: 10,
            }}
            onMouseDown={(e) => onDragStart(e, subtitle.id, 'subtitle')}
        >
            {subtitle.text}
        </div>
    )
}
