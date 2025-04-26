"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

export interface SubtitleFormProps {
    text: string
    setText: (text: string) => void
    handleAddSubtitle: () => void
}

export default function SubtitleForm({ text, setText, handleAddSubtitle }: SubtitleFormProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-2">
                <Label htmlFor="subtitle-text">Caption Text</Label>
                <Textarea
                    id="subtitle-text"
                    placeholder="Enter subtitles"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="mt-1 focus:ring-0"
                />
            </div>

            <Button className="w-full focus:ring-0" onClick={handleAddSubtitle}>
                <Plus className="h-4 w-4 mr-2" />
                Add Caption
            </Button>
        </div>
    );
}
