"use client"

import { useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import VideoUpload from "./video-upload"
import { Film, ImageIcon, Music, Trash2, Upload, Video } from "lucide-react"
import { setActiveVideo, removeVideo } from "@/lib/store/slices/videoSlice"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

interface DraggableVideoItemProps {
    id: string
    thumbnail: string | null | undefined
    name: string
    size: number
    isActive: boolean
    onRemove: () => void
    onSelect: () => void
}

function DraggableVideoItem({ id, thumbnail, name, size, isActive, onRemove, onSelect }: DraggableVideoItemProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: {
            type: 'video',
            id: id,
            name: name,
            thumbnail: thumbnail,
            size: size
        }
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        border: isActive ? '2px solid #3b82f6' : '',
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 1
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="media-item rounded-md overflow-hidden border bg-gray-50 relative group cursor-move touch-manipulation"
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            {...listeners}
            {...attributes}
        >
            <div className="aspect-video relative">
                <img
                    src={thumbnail || "/placeholder.svg"}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                    draggable={false}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-8 w-8 text-white opacity-80" />
                </div>
            </div>
            <div className="p-2">
                <p className="text-xs font-medium truncate">{name}</p>
                <p className="text-xs text-gray-500">{(size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <Button
                variant="destructive"
                size="icon"
                className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
            >
                <Trash2 className="h-3 w-3" />
            </Button>
        </div>
    )
}

export default function MediaPanel() {
    const dispatch = useAppDispatch()
    const { videos, activeVideoId } = useAppSelector((state) => state.video)
    const { images } = useAppSelector((state) => state.overlay)
    const [showUpload, setShowUpload] = useState(videos.length === 0)

    const handleRemoveVideo = (id: string) => {
        dispatch(removeVideo(id))
    }

    const handleSelectVideo = (id: string) => {
        dispatch(setActiveVideo(id))
    }

    return (
        <div className="space-y-4">
            {showUpload ? (
                <div className="space-y-4">
                    <VideoUpload />
                    {videos.length > 0 && (
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setShowUpload(false)}>
                            Close Upload
                        </Button>
                    )}
                </div>
            ) : (
                <Button className="w-full" onClick={() => setShowUpload(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Media
                </Button>
            )}

            <Tabs defaultValue="videos">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="audio">Audio</TabsTrigger>
                </TabsList>

                <TabsContent value="videos" className="mt-4">
                    <ScrollArea className="h-[400px]">
                        <div className="grid grid-cols-2 gap-3">
                            {videos.length > 0 ? (
                                videos.map((video) => (
                                    <DraggableVideoItem
                                        key={video.id}
                                        id={video.id}
                                        thumbnail={video.thumbnail}
                                        name={video.name}
                                        size={video.size}
                                        isActive={video.id === activeVideoId}
                                        onRemove={() => handleRemoveVideo(video.id)}
                                        onSelect={() => handleSelectVideo(video.id)}
                                    />
                                ))
                            ) : (
                                <div className="aspect-video rounded-md border flex items-center justify-center bg-gray-50 text-gray-400">
                                    <div className="text-center">
                                        <Film className="h-8 w-8 mx-auto mb-1" />
                                        <p className="text-xs">No videos</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="images" className="mt-4">
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="grid grid-cols-2 gap-3">
                            {images.length > 0 ? (
                                images.map((image) => (
                                    <div key={image.id} className="media-item rounded-md overflow-hidden border bg-gray-50">
                                        <div className="aspect-video relative">
                                            <img
                                                src={image.url || "/placeholder.svg"}
                                                alt="Image overlay"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-2">
                                            <p className="text-xs font-medium truncate">Image Overlay</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="aspect-video rounded-md border flex items-center justify-center bg-gray-50 text-gray-400">
                                    <div className="text-center">
                                        <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                                        <p className="text-xs">No images</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="audio" className="mt-4">
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="aspect-video rounded-md border flex items-center justify-center bg-gray-50 text-gray-400">
                                <div className="text-center">
                                    <Music className="h-8 w-8 mx-auto mb-1" />
                                    <p className="text-xs">No audio files</p>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    )
}
