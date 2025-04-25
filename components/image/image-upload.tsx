"use client"

import { Button } from "@/components/ui/button"
import { Trash2, ImageIcon } from "lucide-react"
import { formatTime } from "@/lib/utils/video-utils"
import { ImageOverlay } from "@/lib/store/slices/overlaySlice"

export interface ImageUploadProps {
    getRootProps: any
    getInputProps: any
    isDragActive: boolean
    images: ImageOverlay[]
    selectedImage: string | null
    setSelectedImage: (id: string | null) => void
    handleRemoveImage: (id: string) => void
}

export default function ImageUpload({
    getRootProps,
    getInputProps,
    isDragActive,
    images,
    selectedImage,
    setSelectedImage,
    handleRemoveImage
}: ImageUploadProps) {
    return (
        <>
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg mt-4 p-6 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary/50"}`}
            >
                <input {...getInputProps()} />
                <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-400">
                    {isDragActive ? "Drop the image here" : "Drag & drop an image here, or click to select"}
                </p>
            </div>

            <div className="space-y-3 mt-4">
                <h4 className="text-sm font-medium">Current Images</h4>
                {images.length === 0 ? (
                    <div className="flex items-center justify-center h-32 border rounded-md bg-background text-gray-400">
                        <div className="text-center">
                            <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No images added yet</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className={`video-item rounded-md overflow-hidden border group ${selectedImage === image.id ? "ring-2 ring-primary" : ""}`}
                                onClick={() => setSelectedImage(image.id)}
                            >
                                <div className="aspect-video relative">
                                    <img src={image.url || "/placeholder.svg"} alt="Overlay" className="w-full h-full object-cover" />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveImage(image.id);
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="p-2 text-xs">
                                    {formatTime(image.startTime)} - {formatTime(image.endTime)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
