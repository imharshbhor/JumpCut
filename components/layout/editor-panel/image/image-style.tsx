"use client"

import { useState, useEffect } from "react"
import { ImageIcon, Move } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ColorPicker } from "@/components/ui/color-picker"
import { ImageOverlay } from "@/lib/store/slices/imageSlice"

export interface ImageStyleProps {
    selectedImage: string | null
    selectedImageData: ImageOverlay | null
    handleUpdateImage: (id: string, changes: any) => void
}

export default function ImageStyle({
    selectedImage,
    selectedImageData,
    handleUpdateImage
}: ImageStyleProps) {
    const [opacity, setOpacity] = useState(100)
    const [rotation, setRotation] = useState(0)
    const [borderWidth, setBorderWidth] = useState(0)
    const [borderColor, setBorderColor] = useState("#ffffff")
    const [borderStyle, setBorderStyle] = useState("solid")
    const [animationType, setAnimationType] = useState("none")
    const [animationDuration, setAnimationDuration] = useState(1)

    useEffect(() => {
        if (selectedImageData) {
            setOpacity(selectedImageData.opacity * 100)
            setRotation(selectedImageData.rotation)
            if (selectedImageData.border) {
                setBorderWidth(selectedImageData.border.width || 0)
                setBorderColor(selectedImageData.border.color || "#ffffff")
                setBorderStyle(selectedImageData.border.style || "solid")
            }
            if (selectedImageData.animation) {
                setAnimationType(selectedImageData.animation.type || "none")
                setAnimationDuration(selectedImageData.animation.duration || 1)
            }
        }
    }, [selectedImageData])

    const handleOpacityChange = (value: number) => {
        setOpacity(value)
        if (selectedImage) {
            handleUpdateImage(selectedImage, { opacity: value / 100 })
        }
    }

    const handleRotationChange = (value: number) => {
        setRotation(value)
        if (selectedImage) {
            handleUpdateImage(selectedImage, { rotation: value })
        }
    }

    const handleBorderWidthChange = (value: number) => {
        setBorderWidth(value)
        if (selectedImage) {
            handleUpdateImage(selectedImage, {
                border: {
                    width: value,
                    color: borderColor,
                    style: borderStyle
                }
            })
        }
    }

    const handleBorderColorChange = (value: string) => {
        setBorderColor(value)
        if (selectedImage) {
            handleUpdateImage(selectedImage, {
                border: {
                    width: borderWidth,
                    color: value,
                    style: borderStyle
                }
            })
        }
    }

    const handleBorderStyleChange = (value: string) => {
        setBorderStyle(value)
        if (selectedImage) {
            handleUpdateImage(selectedImage, {
                border: {
                    width: borderWidth,
                    color: borderColor,
                    style: value
                }
            })
        }
    }

    const handleAnimationTypeChange = (value: string) => {
        setAnimationType(value)
        if (selectedImage) {
            handleUpdateImage(selectedImage, {
                animation: {
                    type: value,
                    duration: animationDuration
                }
            })
        }
    }

    const handleAnimationDurationChange = (value: number) => {
        setAnimationDuration(value)
        if (selectedImage) {
            handleUpdateImage(selectedImage, {
                animation: {
                    type: animationType,
                    duration: value
                }
            })
        }
    }

    if (!selectedImageData) {
        return (
            <div className="flex items-center justify-center h-64 border rounded-md bg-background text-gray-400">
                <div className="text-center">
                    <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select an image to edit style</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="aspect-video relative border rounded-md overflow-hidden">
                <img
                    src={selectedImageData.url || "/placeholder.svg"}
                    alt="Selected overlay"
                    className="w-full h-full object-contain"
                    style={{
                        opacity: selectedImageData.opacity,
                        transform: `rotate(${selectedImageData.rotation}deg)`,
                        border: selectedImageData.border ?
                            `${selectedImageData.border.width}px ${selectedImageData.border.style} ${selectedImageData.border.color}` :
                            'none'
                    }}
                />
            </div>

            <div className="space-y-3">
                <div>
                    <Label htmlFor="image-opacity">Opacity</Label>
                    <div className="flex items-center space-x-2">
                        <Slider
                            id="image-opacity"
                            value={[opacity]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(value) => handleOpacityChange(value[0])}
                            className="flex-1"
                        />
                        <span className="text-sm w-8 text-right">{opacity}%</span>
                    </div>
                </div>

                <div>
                    <Label htmlFor="image-rotation" className="flex items-center mb-2">
                        Rotation
                    </Label>
                    <div className="flex items-center space-x-2">
                        <Slider
                            id="image-rotation"
                            value={[rotation]}
                            min={0}
                            max={360}
                            step={1}
                            onValueChange={(value) => handleRotationChange(value[0])}
                            className="flex-1"
                        />
                        <span className="text-sm w-8 text-right">{rotation}°</span>
                    </div>
                </div>

                <div>
                    <Label htmlFor="border-controls" className="flex items-center mb-2">
                        Border
                    </Label>

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <Label htmlFor="border-width" className="text-xs">Width</Label>
                            <div className="flex flex-row items-center mt-3">
                                <Slider
                                    id="border-width"
                                    value={[borderWidth]}
                                    min={0}
                                    max={20}
                                    step={1}
                                    onValueChange={(value) => handleBorderWidthChange(value[0])}
                                    className="flex-1"
                                />
                                <span className="text-xs w-6 text-center">{borderWidth}</span>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="border-style" className="text-xs">Style</Label>
                            <Select value={borderStyle} onValueChange={handleBorderStyleChange}>
                                <SelectTrigger id="border-style">
                                    <SelectValue placeholder="Style" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="solid">Solid</SelectItem>
                                    <SelectItem value="dashed">Dashed</SelectItem>
                                    <SelectItem value="dotted">Dotted</SelectItem>
                                    <SelectItem value="double">Double</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="border-color" className="text-xs">Color</Label>
                            <ColorPicker
                                color={borderColor}
                                onChange={handleBorderColorChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t mt-4">
                    <h3 className="text-sm font-medium flex items-center mb-3">
                        <Move className="h-4 w-4 mr-1" />
                        Animation Effects
                    </h3>

                    <div className="flex flex-col items-start gap-2">
                        <Select
                            value={animationType}
                            onValueChange={handleAnimationTypeChange}
                        >
                            <SelectTrigger id="animation-type">
                                <SelectValue placeholder="Select animation" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="fade-in">Fade In</SelectItem>
                                <SelectItem value="fade-out">Fade Out</SelectItem>
                                <SelectItem value="zoom-in">Zoom In</SelectItem>
                                <SelectItem value="zoom-out">Zoom Out</SelectItem>
                                <SelectItem value="slide-in-left">Slide In Left</SelectItem>
                                <SelectItem value="slide-in-right">Slide In Right</SelectItem>
                                <SelectItem value="slide-in-top">Slide In Top</SelectItem>
                                <SelectItem value="slide-in-bottom">Slide In Bottom</SelectItem>
                                <SelectItem value="pulse">Pulse</SelectItem>
                                <SelectItem value="rotate">Rotate</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {animationType !== "none" && (
                        <div className="mt-3">
                            <Label htmlFor="animation-duration">Animation Duration (seconds)</Label>
                            <div className="flex items-center space-x-2">
                                <Slider
                                    id="animation-duration"
                                    value={[animationDuration]}
                                    min={0.1}
                                    max={5}
                                    step={0.1}
                                    onValueChange={(value) => handleAnimationDurationChange(value[0])}
                                    className="flex-1"
                                />
                                <span className="text-sm w-8 text-right">{animationDuration}s</span>
                            </div>
                        </div>
                    )}

                    {animationType !== "none" && (
                        <div className="aspect-video relative border rounded-md overflow-hidden mt-4">
                            <div className={`w-full h-full flex items-center justify-center ${animationType !== 'none' ? `animate-${animationType}` : ''}`}
                                style={{
                                    animationDuration: `${animationDuration}s`,
                                }}>
                                <img
                                    src={selectedImageData.url || "/placeholder.svg"}
                                    alt="Animation preview"
                                    className="max-w-full max-h-full object-contain"
                                    style={{
                                        opacity: selectedImageData.opacity,
                                        transform: `rotate(${selectedImageData.rotation}deg)`,
                                        border: selectedImageData.border ?
                                            `${selectedImageData.border.width}px ${selectedImageData.border.style} ${selectedImageData.border.color}` :
                                            'none'
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
