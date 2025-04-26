"use client"

import { useState, useRef, useEffect } from "react"
import { useAppSelector } from "@/lib/store/hooks"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Copy, Download, Facebook, Film, Instagram, Mail, Share2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"

export default function ExportPanel() {
    const { videoFile, thumbnail } = useAppSelector((state) => state.video)
    const [isRendering, setIsRendering] = useState(false)
    const [renderProgress, setRenderProgress] = useState(0)
    const [format, setFormat] = useState("mp4")
    const [quality, setQuality] = useState("high")
    const { toast } = useToast()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [videoUrl, setVideoUrl] = useState<string>(null)

    useEffect(() => {
        if (videoFile) {
            const url = URL.createObjectURL(videoFile)
            setVideoUrl(url)

            return () => {
                URL.revokeObjectURL(url)
            }
        }
    }, [videoFile])

    const handleRender = () => {
        if (!videoFile) {
            toast({
                title: "No video to export",
                description: "Please upload a video first",
                variant: "destructive",
            })
            return
        }

        setIsRendering(true)
        setRenderProgress(0)

        let lastUpdate = Date.now()

        const interval = setInterval(() => {
            const now = Date.now()
            const elapsed = now - lastUpdate
            lastUpdate = now

            setRenderProgress((prev) => {
                let speed
                if (prev < 30) {
                    speed = 0.02 * elapsed
                } else if (prev < 70) {
                    speed = 0.008 * elapsed
                } else {
                    speed = 0.015 * elapsed
                }

                const newProgress = prev + speed
                if (newProgress >= 100) {
                    clearInterval(interval)
                    setIsRendering(false)
                    toast({
                        title: "Export complete",
                        description: "Your video has been rendered successfully",
                    })
                    return 100
                }
                return newProgress
            })
        }, 100)
    }

    const handleDownload = () => {
        toast({
            title: "Download started",
            description: "Your video will be downloaded shortly",
        })

        setTimeout(() => {
            if (videoFile) {
                const url = URL.createObjectURL(videoFile)
                const a = document.createElement("a")
                a.href = url
                a.download = `edited-video.${format}`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            }
        }, 1500)
    }

    return (
        <div className="space-y-6">
            <DialogHeader>
                <DialogTitle>Export Video</DialogTitle>
                <DialogDescription>
                    Configure your export settings and render your video
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                <h3 className="text-sm font-medium">Export Settings</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="format">Format</Label>
                        <Select value={format} onValueChange={setFormat}>
                            <SelectTrigger id="format" className="ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mp4">MP4</SelectItem>
                                <SelectItem value="webm">WebM</SelectItem>
                                <SelectItem value="mov">MOV</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="quality">Quality</Label>
                        <Select value={quality} onValueChange={setQuality}>
                            <SelectTrigger id="quality" className="ring-offset-0 focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Select quality" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low (480p)</SelectItem>
                                <SelectItem value="medium">Medium (720p)</SelectItem>
                                <SelectItem value="high">High (1080p)</SelectItem>
                                <SelectItem value="ultra">Ultra (4K)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {videoFile && (
                <Card>
                    <CardContent className="p-3">
                        <div className="aspect-video relative">
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                poster={thumbnail || "/placeholder.svg"}
                                className="w-full h-full object-cover rounded-sm"
                                controls
                            />
                        </div>
                        <div className="mt-2 text-xs text-center text-gray-500" style={{ fontFamily: 'monospace', userSelect: 'none' }}>Preview of your edited video</div>
                    </CardContent>
                </Card>
            )}

            {isRendering ? (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Rendering...</span>
                        <span className="text-sm">{Math.round(renderProgress)}%</span>
                    </div>
                    <Progress value={renderProgress} className="h-2" />
                </div>
            ) : renderProgress === 100 ? (
                <DialogFooter className="flex flex-col justify-center items-center space-y-3">
                    <Button className="w-full mt-3" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Video
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share Video
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Share Your Video</DialogTitle>
                                <DialogDescription>
                                    Choose how you want to share your exported video
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <Button variant="outline"><Copy className="h-4 w-4" />Copy Link</Button>
                                <Button variant="outline"><Mail className="h-4 w-4" />Email</Button>
                                <Button variant="outline"><Instagram className="h-4 w-4" />Instagram</Button>
                                <Button variant="outline"><Facebook className="h-4 w-4" />Facebook</Button>
                            </div>
                            <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
                </DialogClose>
              </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </DialogFooter>
            ) : (
                <DialogFooter>
                    <Button className="w-full" onClick={handleRender} disabled={!videoFile}>
                        <Film className="h-4 w-4 mr-2" />
                        Render Video
                    </Button>
                </DialogFooter>
            )}
        </div>
    )
}
