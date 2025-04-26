"use client"

import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import VideoUpload from "./video-upload"
import { Film, Trash2, Video } from "lucide-react"
import { setActiveVideo, resetVideo } from "@/lib/store/slices/videoSlice"
import { resetAudio } from "@/lib/store/slices/audioSlice"
import { resetTimeline } from "@/lib/store/slices/timelineSlice"
import { resetSubtitles } from "@/lib/store/slices/subtitleSlice"
import { resetOverlays } from "@/lib/store/slices/overlaySlice"

interface VideoItemProps {
    id: string
    thumbnail: string | null | undefined
    name: string
    size: number
    isActive: boolean
    onRemove: () => void
    onSelect: () => void
}

function VideoItem({ thumbnail, name, size, isActive, onRemove, onSelect }: VideoItemProps) {
    const style = {
        border: isActive ? '2px solid #3b82f6' : ''
    }

    return (
        <div
            style={style}
            className="video-item rounded-md overflow-hidden border bg-background relative group cursor-pointer"
            onClick={onSelect}
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

export default function VideoPanel() {
    const dispatch = useAppDispatch()
    const { videos, activeVideoId } = useAppSelector((state) => state.video)
    const { images } = useAppSelector((state) => state.overlay)

    const handleRemoveVideo = () => {
        dispatch(resetVideo())
        dispatch(resetTimeline())
        dispatch(resetAudio())
        dispatch(resetSubtitles())
        dispatch(resetOverlays())
    }

    const handleSelectVideo = (id: string) => {
        dispatch(setActiveVideo(id))
    }

    return (
        <div className="space-y-4">
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Film className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-medium">Video Manager</h2>
                </div>
                <VideoUpload />
            </div>

            <Tabs defaultValue="videos">
                <TabsContent value="videos" className="mt-4">
                    <ScrollArea className="h-[400px]">
                        <div className="grid grid-cols-2 gap-3">
                            {videos.length > 0 ? (
                                videos.map((video) => (
                                    <VideoItem
                                        key={video.id}
                                        id={video.id}
                                        thumbnail={video.thumbnail}
                                        name={video.name}
                                        size={video.size}
                                        isActive={video.id === activeVideoId}
                                        onRemove={handleRemoveVideo}
                                        onSelect={() => handleSelectVideo(video.id)}
                                    />
                                ))
                            ) : (
                                <div className="aspect-video rounded-md border flex items-center justify-center bg-background text-gray-400">
                                    <div className="text-center">
                                        <Film className="h-8 w-8 mx-auto mb-1" />
                                        <p className="text-xs">No videos</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    )
}
