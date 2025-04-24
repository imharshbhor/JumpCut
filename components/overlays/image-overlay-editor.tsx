"use client"

import { useState, useCallback, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { addImageOverlay, removeImageOverlay, updateImageOverlay } from "@/lib/store/slices/overlaySlice"
import { formatTime } from "@/lib/utils/video-utils"
import { v4 as uuidv4 } from "uuid"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Trash2, ImageIcon, RotateCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ImageOverlayEditor() {
  const dispatch = useAppDispatch()
  const { images } = useAppSelector((state) => state.overlay)
  const { currentTime } = useAppSelector((state) => state.timeline)
  const { duration } = useAppSelector((state) => state.video)
  const [opacity, setOpacity] = useState(100)
  const [rotation, setRotation] = useState(0)
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

      const newImage = {
        id: uuidv4(),
        url: imageUrl,
        position: { x: 50, y: 50 }, // Center position (percentage)
        size: { width: 200, height: 200 },
        rotation,
        opacity: opacity / 100,
        startTime: currentTime,
        endTime: duration,
        zIndex: images.length + 1,
      }

      dispatch(addImageOverlay(newImage))
      setSelectedImage(newImage.id)
    },
    [dispatch, currentTime, duration, images.length, opacity, rotation],
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

  const selectedImageData = selectedImage ? images.find((img) => img.id === selectedImage) : null

  // Sync state with selected image
  useEffect(() => {
    if (selectedImageData) {
      setOpacity(selectedImageData.opacity * 100)
      setRotation(selectedImageData.rotation)
    }
  }, [selectedImageData])

  return (
    <div className="space-y-4">
      <Tabs defaultValue="upload">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive ? "Drop the image here" : "Drag & drop an image here, or click to select"}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Current Images</h4>
            {images.length === 0 ? (
              <div className="flex items-center justify-center h-32 border rounded-md bg-gray-50 text-gray-400">
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
                    className={`media-item rounded-md overflow-hidden border ${selectedImage === image.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedImage(image.id)}
                  >
                    <div className="aspect-video relative">
                      <img src={image.url || "/placeholder.svg"} alt="Overlay" className="w-full h-full object-cover" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 bg-black/50 text-white hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveImage(image.id)
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
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          {selectedImageData ? (
            <>
              <div className="aspect-video relative border rounded-md overflow-hidden">
                <img
                  src={selectedImageData.url || "/placeholder.svg"}
                  alt="Selected overlay"
                  className="w-full h-full object-contain"
                  style={{
                    opacity: selectedImageData.opacity,
                    transform: `rotate(${selectedImageData.rotation}deg)`,
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
                  <Label htmlFor="image-rotation" className="flex items-center">
                    <RotateCw className="h-4 w-4 mr-1" />
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
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 border rounded-md bg-gray-50 text-gray-400">
              <div className="text-center">
                <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select an image to edit</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
