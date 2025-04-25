"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react"

export interface StyleControlsProps {
    fontFamily: string
    fontSize: number
    color: string
    bgColor: string
    opacity: number
    alignment: string
    setFontFamily: (font: string) => void
    setFontSize: (size: number) => void
    setColor: (color: string) => void
    setBgColor: (color: string) => void
    setOpacity: (opacity: number) => void
    setAlignment: (alignment: string) => void
}

export default function SubtitleStyle({
    fontFamily,
    fontSize,
    color,
    bgColor,
    opacity,
    alignment,
    setFontFamily,
    setFontSize,
    setColor,
    setBgColor,
    setOpacity,
    setAlignment
}: StyleControlsProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="font-family">Font</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger id="font-family" className="focus:ring-0">
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

                <div className="flex flex-col gap-2">
                    <Label htmlFor="font-size">Font Size</Label>
                    <div className="flex items-center space-x-2 mt-[0.6rem]">
                        <Slider
                            id="font-size"
                            value={[fontSize]}
                            min={8}
                            max={48}
                            step={1}
                            onValueChange={(value) => setFontSize(value[0])}
                            className="flex-1 focus:ring-0"
                        />
                        <span className="text-sm w-8 text-right">{fontSize}px</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label>Alignment</Label>
                <ToggleGroup
                    type="single"
                    value={alignment}
                    onValueChange={(value) => value && setAlignment(value)}
                    className="justify-start mt-1"
                >
                    <ToggleGroupItem value="left" className="focus:ring-0">
                        <AlignLeft className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" className="focus:ring-0">
                        <AlignCenter className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right" className="focus:ring-0">
                        <AlignRight className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex mt-1">
                        <div className="w-8 h-10 border rounded-l-md" style={{ backgroundColor: color }} />
                        <Input
                            id="text-color"
                            type="text"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="rounded-l-none focus:ring-0"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="bg-color">Background</Label>
                    <div className="flex mt-1">
                        <div className="w-8 h-10 border rounded-l-md" style={{ backgroundColor: bgColor }} />
                        <Input
                            id="bg-color"
                            type="text"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="rounded-l-none focus:ring-0"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="opacity">Background Opacity</Label>
                <div className="flex items-center space-x-2">
                    <Slider
                        id="opacity"
                        value={[opacity]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => setOpacity(value[0])}
                        className="flex-1 focus:ring-0"
                    />
                    <span className="text-sm w-8 text-right">{opacity}%</span>
                </div>
            </div>
        </div>
    );
}
