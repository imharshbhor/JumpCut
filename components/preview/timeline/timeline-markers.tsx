"use client"

import { formatTime } from "@/lib/utils/video-utils"

interface TimelineMarkersProps {
    duration: number
    zoom: number
}

export default function TimelineMarkers({ duration, zoom }: TimelineMarkersProps) {
    const getMarkerInterval = () => {
        return 5;
    }

    const interval = getMarkerInterval();
    const markerCount = Math.ceil(duration / interval) + 1;
    const markers = Array.from({ length: markerCount }, (_, i) => i * interval);

    return (
        <div className="relative w-full h-6 mb-1">
            {markers.map((time) => {
                const position = (time / duration) * 100;

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
