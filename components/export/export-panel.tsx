"use client"

import { useState } from "react"
import { useAppSelector } from "@/lib/store/hooks"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, Film, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"

export default function ExportPanel() {
  const { videoFile, thumbnail } = useAppSelector((state) => state.video)
  const [isRendering, setIsRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [format, setFormat] = useState("mp4")
  const [quality, setQuality] = useState("high")
  const { toast } = useToast()

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

    // Simulate rendering progress with variable speed
    // Start fast, slow down in the middle, then speed up at the end
    let lastUpdate = Date.now()

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastUpdate
      lastUpdate = now

      setRenderProgress((prev) => {
        // Calculate speed based on current progress
        // Slower in the middle (30-70%)
        let speed
        if (prev < 30) {
          speed = 0.02 * elapsed // Faster at start
        } else if (prev < 70) {
          speed = 0.008 * elapsed // Slower in middle
        } else {
          speed = 0.015 * elapsed // Medium at end
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

    // Simulate download delay
    setTimeout(() => {
      // In a real app, we would create a download link to the rendered video
      // For now, we'll just download the original video
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
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Export Settings</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format">
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
              <SelectTrigger id="quality">
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

      {thumbnail && (
        <Card>
          <CardContent className="p-3">
            <div className="aspect-video relative">
              <img
                src={thumbnail || "/placeholder.svg"}
                alt="Video thumbnail"
                className="w-full h-full object-cover rounded-sm"
              />
            </div>
            <div className="mt-2 text-xs text-center text-gray-500">Preview of your edited video</div>
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
        <div className="space-y-3">
          <Button className="w-full" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Video
          </Button>
          <Button variant="outline" className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Share Video
          </Button>
        </div>
      ) : (
        <Button className="w-full" onClick={handleRender} disabled={!videoFile}>
          <Film className="h-4 w-4 mr-2" />
          Render Video
        </Button>
      )}
    </div>
  )
}
