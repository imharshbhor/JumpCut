"use client"

interface ImageOverlayProps {
    image: any
    isDragging: boolean
    isSelected: boolean
    onDragStart: (e: React.MouseEvent, id: string, type: 'subtitle' | 'image' | 'text') => void
    onResizeStart: (e: React.MouseEvent, id: string, handle: string) => void
}

export default function ImageOverlay({
    image,
    isDragging,
    isSelected,
    onDragStart,
    onResizeStart
}: ImageOverlayProps) {
    return (
        <div
            key={image.id}
            className={`absolute resizable-image ${isSelected ? 'selected' : ''} ${image.animation?.type && image.animation.type !== 'none' ? `animate-${image.animation.type}` : ''}`}
            style={{
                left: `${image.position.x}%`,
                top: `${image.position.y}%`,
                transform: `translate(-50%, -50%) rotate(${image.rotation}deg)`,
                width: `${image.size.width}px`,
                height: `${image.size.height}px`,
                opacity: image.opacity,
                zIndex: image.zIndex,
                animationDuration: image.animation?.duration ? `${image.animation.duration}s` : undefined,
                border: image.border ? `${image.border.width}px ${image.border.style} ${image.border.color}` : undefined
            }}
            onMouseDown={(e) => onDragStart(e, image.id, 'image')}
        >
            <img
                src={image.url || "/placeholder.svg"}
                alt="Overlay"
                draggable="false"
            />

            <div
                className="resize-handle resize-handle-nw"
                onMouseDown={(e) => onResizeStart(e, image.id, 'nw')}
            ></div>
            <div
                className="resize-handle resize-handle-ne"
                onMouseDown={(e) => onResizeStart(e, image.id, 'ne')}
            ></div>
            <div
                className="resize-handle resize-handle-sw"
                onMouseDown={(e) => onResizeStart(e, image.id, 'sw')}
            ></div>
            <div
                className="resize-handle resize-handle-se"
                onMouseDown={(e) => onResizeStart(e, image.id, 'se')}
            ></div>
        </div>
    )
}
