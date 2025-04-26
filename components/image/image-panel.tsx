"use client"

import { useState, useCallback, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { addImageOverlay, removeImageOverlay, updateImageOverlay, ImageOverlay } from "@/lib/store/slices/overlaySlice"
import { formatTime } from "@/lib/utils/video-utils"
import { v4 as uuidv4 } from "uuid"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Trash2, ImageIcon, RotateCw, Clock, Move, Palette, ImagesIcon } from "lucide-react"
import { Square } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import ImageUpload from "./image-upload"
import ImageTiming from "./image-timing"
import ImageStyle from "./image-style"

export default function ImagePanel() {
    const dispatch = useAppDispatch()
    const { images } = useAppSelector((state) => state.overlay)
    const { currentTime } = useAppSelector((state) => state.timeline)
    const { duration } = useAppSelector((state) => state.video)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return

            const file = acceptedFiles[0]
            if (!file.type.startsWith("image/")) {
                alert("Please upload a valid image file")
                return
            }

            const imageUrl = URL.createObjectURL(file)

            // Create a temporary image to get dimensions
            const img = new Image();
            img.onload = () => {
                // Calculate a reasonable size based on image dimensions
                // Aim for reasonable dimensions that fit well on screen
                const maxWidth = 300;
                const maxHeight = 200;

                let width = img.width;
                let height = img.height;

                // Scale down if necessary while preserving aspect ratio
                if (width > maxWidth) {
                    const ratio = maxWidth / width;
                    width = maxWidth;
                    height = height * ratio;
                }

                if (height > maxHeight) {
                    const ratio = maxHeight / height;
                    height = maxHeight;
                    width = width * ratio;
                }

                const newImage = {
                    id: uuidv4(),
                    url: imageUrl,
                    position: { x: 50, y: 50 }, // Center position (percentage)
                    size: { width, height },
                    rotation: 0,
                    opacity: 1,
                    startTime: currentTime,
                    endTime: duration,
                    zIndex: images.length + 1,
                    border: {
                        width: 0,
                        color: "#ffffff",
                        style: "solid"
                    },
                    animation: {
                        type: "none",
                        duration: 1
                    }
                };

                dispatch(addImageOverlay(newImage));
                setSelectedImage(newImage.id);
            };

            img.src = imageUrl;
        },
        [dispatch, currentTime, duration, images.length]
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [],
        },
        maxFiles: 1,
    })

    const handleRemoveImage = (id: string) => {
        dispatch(removeImageOverlay(id))
        if (selectedImage === id) {
            setSelectedImage(null)
        }
    }

    const handleUpdateImage = (id: string, changes: any) => {
        dispatch(updateImageOverlay({ id, ...changes }))
    }

    const selectedImageData: ImageOverlay | null = selectedImage
        ? images.find((img) => img.id === selectedImage) || null
        : null

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <ImagesIcon className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-medium">Image Manager</h2>
            </div>
            <Tabs defaultValue="upload">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="timing">Timing</TabsTrigger>
                    <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                    <ImageUpload
                        getRootProps={getRootProps}
                        getInputProps={getInputProps}
                        isDragActive={isDragActive}
                        images={images}
                        selectedImage={selectedImage}
                        setSelectedImage={setSelectedImage}
                        handleRemoveImage={handleRemoveImage}
                    />
                </TabsContent>

                <TabsContent value="timing" className="space-y-4">
                    <ImageTiming
                        selectedImage={selectedImage}
                        selectedImageData={selectedImageData}
                        currentTime={currentTime}
                        duration={duration}
                        handleUpdateImage={handleUpdateImage}
                    />
                </TabsContent>

                <TabsContent value="style" className="space-y-4">
                    <ImageStyle
                        selectedImage={selectedImage}
                        selectedImageData={selectedImageData}
                        handleUpdateImage={handleUpdateImage}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
