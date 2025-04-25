import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface ColorPickerProps {
    color: string
    onChange: (color: string) => void
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    const colors = [
        "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
        "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
        "#008000", "#800000", "#008080", "#000080", "#FFC0CB",
    ]

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full h-10 flex items-center justify-center"
                    style={{ backgroundColor: color }}
                >
                    <span className="sr-only">Pick a color</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
                <div className="grid grid-cols-5 gap-1">
                    {colors.map((c) => (
                        <button
                            key={c}
                            className="w-full aspect-square rounded border border-gray-300 cursor-pointer"
                            style={{ backgroundColor: c }}
                            onClick={() => {
                                onChange(c)
                                setIsOpen(false)
                            }}
                            aria-label={`Color ${c}`}
                        />
                    ))}
                </div>
                <div className="mt-2">
                    <input
                        type="text"
                        value={color}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full border rounded p-1 text-xs"
                        placeholder="#RRGGBB"
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}
