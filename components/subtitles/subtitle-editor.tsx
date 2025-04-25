"use client"

import { useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { addSubtitle, removeSubtitle } from "@/lib/store/slices/subtitleSlice"
import { formatTime } from "@/lib/utils/video-utils"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Plus, Trash2, Type, AlignCenter, AlignLeft, AlignRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function SubtitleEditor() {
    const dispatch = useAppDispatch()
    const { subtitles } = useAppSelector((state) => state.subtitle)
    const { currentTime } = useAppSelector((state) => state.timeline)
    const [text, setText] = useState("")
    const [fontFamily, setFontFamily] = useState("Arial")
    const [fontSize, setFontSize] = useState(16)
    const [color, setColor] = useState("#ffffff")
    const [bgColor, setBgColor] = useState("#000000")
    const [opacity, setOpacity] = useState(80)
    const [alignment, setAlignment] = useState("center")

    const handleAddSubtitle = () => {
        if (!text.trim()) return

        const newSubtitle = {
            id: uuidv4(),
            text,
            startTime: currentTime,
            endTime: currentTime + 5, // Default 5 seconds duration
            position: { x: 50, y: 80 }, // Default position (percentage)
            style: {
                fontFamily,
                fontSize,
                color,
                backgroundColor: bgColor,
                opacity: opacity / 100,
                textAlign: alignment, // Add this line
            },
        }

        dispatch(addSubtitle(newSubtitle))
        setText("")
    }

    const handleRemoveSubtitle = (id: string) => {
        dispatch(removeSubtitle(id))
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div>
                    <Label htmlFor="subtitle-text">Caption Text</Label>
                    <Textarea
                        id="subtitle-text"
                        placeholder="Enter subtitle text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="mt-1"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="font-family">Font</Label>
                        <Select value={fontFamily} onValueChange={setFontFamily}>
                            <SelectTrigger id="font-family">
                                <SelectValue placeholder="Select font" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Arial">Arial</SelectItem>
                                <SelectItem value="Verdana">Verdana</SelectItem>
                                <SelectItem value="Helvetica">Helvetica</SelectItem>
                                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                <SelectItem value="Courier New">Courier New</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="font-size">Font Size</Label>
                        <div className="flex items-center space-x-2">
                            <Slider
                                id="font-size"
                                value={[fontSize]}
                                min={8}
                                max={48}
                                step={1}
                                onValueChange={(value) => setFontSize(value[0])}
                                className="flex-1"
                            />
                            <span className="text-sm w-8 text-right">{fontSize}px</span>
                        </div>
                    </div>
                </div>

                <div>
                    <Label>Alignment</Label>
                    <ToggleGroup
                        type="single"
                        value={alignment}
                        onValueChange={(value) => value && setAlignment(value)}
                        className="justify-start mt-1"
                    >
                        <ToggleGroupItem value="left">
                            <AlignLeft className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="center">
                            <AlignCenter className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="right">
                            <AlignRight className="h-4 w-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="text-color">Text Color</Label>
                        <div className="flex mt-1">
                            <div className="w-8 h-8 border rounded-l-md" style={{ backgroundColor: color }} />
                            <Input
                                id="text-color"
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="rounded-l-none"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="bg-color">Background</Label>
                        <div className="flex mt-1">
                            <div className="w-8 h-8 border rounded-l-md" style={{ backgroundColor: bgColor }} />
                            <Input
                                id="bg-color"
                                type="text"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="rounded-l-none"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <Label htmlFor="opacity">Background Opacity</Label>
                    <div className="flex items-center space-x-2">
                        <Slider
                            id="opacity"
                            value={[opacity]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(value) => setOpacity(value[0])}
                            className="flex-1"
                        />
                        <span className="text-sm w-8 text-right">{opacity}%</span>
                    </div>
                </div>

                <Button className="w-full" onClick={handleAddSubtitle}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Caption
                </Button>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Current Captions</h4>
                {subtitles.length === 0 ? (
                    <div className="flex items-center justify-center h-32 border rounded-md bg-background text-gray-400">
                        <div className="text-center">
                            <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No captions added yet</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {subtitles.map((subtitle) => (
                            <div key={subtitle.id} className="flex items-center justify-between border rounded-md p-2 bg-background">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <Type className="h-4 w-4 mr-2 text-gray-500" />
                                        <span className="text-sm font-medium truncate">{subtitle.text}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatTime(subtitle.startTime)} - {formatTime(subtitle.endTime)}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleRemoveSubtitle(subtitle.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
