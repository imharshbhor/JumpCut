"use client"

import { Clock } from "lucide-react"
import { ImageOverlay } from "@/lib/store/slices/overlaySlice"
import TimingControls from "@/components/shared/timing-controls"

export interface ImageTimingProps {
    selectedImage: string | null
    selectedImageData: ImageOverlay | null
    currentTime: number
    duration: number
    handleUpdateImage: (id: string, changes: any) => void
}

export default function ImageTiming({
    selectedImage,
    selectedImageData,
    currentTime,
    duration,
    handleUpdateImage
}: ImageTimingProps) {
    const handleStartTimeChange = (time: number) => {
        if (selectedImage) {
            handleUpdateImage(selectedImage, { startTime: time })
        }
    }

    const handleEndTimeChange = (time: number) => {
        if (selectedImage) {
            handleUpdateImage(selectedImage, { endTime: time })
        }
    }

    if (!selectedImageData) {
        return (
            <div className="flex items-center justify-center h-64 border rounded-md bg-background text-gray-400">
                <div className="text-center">
                    <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select an image to edit timing</p>
                </div>
            </div>
        )
    }

    return (
        <TimingControls
            startTime={selectedImageData.startTime}
            endTime={selectedImageData.endTime}
            duration={duration}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            currentTime={currentTime}
            showSetCurrentTimeButtons={true}
        />
    )
}
