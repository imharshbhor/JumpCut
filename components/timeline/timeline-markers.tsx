"use client"

import { formatTime } from "@/lib/utils/video-utils"

interface TimelineMarkersProps {
    duration: number
    zoom: number
}

export default function TimelineMarkers({ duration, zoom }: TimelineMarkersProps) {
    // Calculate appropriate marker interval based on zoom level and duration
    const getMarkerInterval = () => {
        if (duration <= 30) return 5; // 5 second intervals for short videos
        if (duration <= 60) return 10; // 10 second intervals for medium videos
        if (duration <= 300) return 15; // 30 second intervals for longer videos
        if (duration <= 900) return 30; // 1 minute intervals for even longer videos
        return 300; // 5 minute intervals for very long videos
    }

    const interval = getMarkerInterval();
    const markerCount = Math.ceil(duration / interval) + 1;
    const markers = Array.from({ length: markerCount }, (_, i) => i * interval);

    return (
        <div className="relative w-full h-6 mb-1">
            {markers.map((time) => {
                // Calculate marker position as percentage of timeline width
                const position = (time / duration) * 100;

                // Skip markers that would be too close together at high zoom levels
                if (zoom > 1 && time % (interval * 2) !== 0 && time !== 0) {
                    return null;
                }

                  return (
                    <div
                        key={time}
                        className="absolute flex flex-col items-center"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                    >
                        <div className="h-2 w-[2px] bg-gray-300" />
                        <div className="text-[10px] text-gray-400">
                            {formatTime(time)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
