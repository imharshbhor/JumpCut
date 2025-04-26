"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Subtitle } from "@/lib/store/slices/subtitleSlice"
import { formatTime } from "@/lib/utils/video-utils"

export interface SubtitleListProps {
    subtitles: Subtitle[]
    handleRemoveSubtitle: (id: string) => void
}

export default function SubtitleList({ subtitles, handleRemoveSubtitle }: SubtitleListProps) {
    return (
        <div>
            <h4 className="text-sm font-medium mb-2">Current Captions</h4>
            {subtitles.length === 0 ? (
                <div className="flex items-center justify-center h-24 border rounded-md bg-background">
                    <p className="text-sm text-gray-500">No captions added yet</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {subtitles.map((subtitle) => (
                        <div
                            key={subtitle.id}
                            className="flex items-center justify-between border rounded-md p-2 hover:bg-accent"
                        >
                            <div className="flex-1 min-w-0 mr-2">
                                <div className="text-sm font-medium truncate">{subtitle.text}</div>
                                <div className="text-xs text-gray-500">
                                    {formatTime(subtitle.startTime)} - {formatTime(subtitle.endTime)}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveSubtitle(subtitle.id)}
                                className="h-8 w-8 text-gray-500 hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
