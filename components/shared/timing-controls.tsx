"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { formatTime } from "@/lib/utils/video-utils"

export interface TimingControlsProps {
    startTime: number
    endTime: number
    duration: number
    onStartTimeChange: (time: number) => void
    onEndTimeChange: (time: number) => void
    currentTime?: number
    showSetCurrentTimeButtons?: boolean
    minDuration?: number
    maxDuration?: number
}

export default function TimingControls({
    startTime,
    endTime,
    duration,
    onStartTimeChange,
    onEndTimeChange,
    currentTime,
    showSetCurrentTimeButtons = false,
    minDuration = 1,
    maxDuration = 30
}: TimingControlsProps) {
    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartTime = parseFloat(parseFloat(e.target.value).toFixed(2))
        if (!isNaN(newStartTime) && newStartTime >= 0 && newStartTime < endTime) {
            onStartTimeChange(newStartTime)
        }
    }

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndTime = parseFloat(parseFloat(e.target.value).toFixed(2))
        if (!isNaN(newEndTime) && newEndTime > startTime && newEndTime <= duration) {
            onEndTimeChange(newEndTime)
        }
    }

    const handleDurationChange = (value: number[]) => {
        const newDuration = value[0]
        onEndTimeChange(parseFloat((startTime + newDuration).toFixed(2)))
    }

    return (
        <div className="flex flex-col gap-2">
            <Label className="flex items-center mt-2">
                Timing
            </Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="flex flex-col gap-1">
                    <Label htmlFor="start-time" className="text-xs">Start Time</Label>
                    <div className="flex items-center">
                        <Input
                            id="start-time"
                            type="number"
                            min="0"
                            step="0.01"
                            value={startTime.toFixed(2)}
                            onChange={handleStartTimeChange}
                            className="focus:ring-0"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <Label htmlFor="end-time" className="text-xs">End Time</Label>
                    <div className="flex items-center">
                        <Input
                            id="end-time"
                            type="number"
                            min="0"
                            step="0.01"
                            value={endTime.toFixed(2)}
                            onChange={handleEndTimeChange}
                            className="focus:ring-0"
                        />
                    </div>
                </div>
            </div>
            <div className="mt-1">
                <Label htmlFor="duration-slider" className="text-xs">
                    Duration: {formatTime(parseFloat((endTime - startTime).toFixed(2)))}
                </Label>
                <Slider
                    id="duration-slider"
                    value={[endTime - startTime]}
                    min={minDuration}
                    max={Math.min(maxDuration, duration - startTime)}
                    step={0.01}
                    onValueChange={handleDurationChange}
                    className="mt-2 focus:ring-0"
                />
            </div>

            {showSetCurrentTimeButtons && currentTime !== undefined && (
                <div className="flex flex-col gap-2 justify-between mt-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStartTimeChange(parseFloat(currentTime.toFixed(2)))}
                    >
                        Set Start to Current Time
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEndTimeChange(parseFloat(currentTime.toFixed(2)))}
                    >
                        Set End to Current Time
                    </Button>
                </div>
            )}
        </div>
    )
}
