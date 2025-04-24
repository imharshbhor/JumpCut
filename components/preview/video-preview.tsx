"use client"

import { useRef, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { setCurrentTime, setIsPlaying } from "@/lib/store/slices/timelineSlice"
import { Button } from "@/components/ui/button"
import { Maximize2} from "lucide-react"

export default function VideoPreview() {
  const dispatch = useAppDispatch()
  const videoRef = useRef<HTMLVideoElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const { videoUrl } = useAppSelector((state) => state.video)
  const { currentTime, isPlaying } = useAppSelector((state) => state.timeline)
  const { subtitles } = useAppSelector((state) => state.subtitle)
  const { images, texts } = useAppSelector((state) => state.overlay)

  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime
    }
  }, [currentTime])

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          dispatch(setIsPlaying(false))
        })
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying, dispatch])

  const handleTimeUpdate = () => {
    if (videoRef.current && !isNaN(videoRef.current.currentTime)) {
      dispatch(setCurrentTime(videoRef.current.currentTime))
    }
  }

  const handleFullscreen = () => {
    if (previewRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        previewRef.current.requestFullscreen()
      }
    }
  }

  const activeSubtitles = subtitles.filter(
    (subtitle) => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime,
  )

  const activeImages = images.filter((image) => currentTime >= image.startTime && currentTime <= image.endTime)

  const activeTexts = texts.filter((text) => currentTime >= text.startTime && currentTime <= text.endTime)

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center">
      <div
        ref={previewRef}
        className="relative flex h-[48vh] bg-black rounded-lg overflow-hidden items-center justify-center"
      >
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="max-h-full max-w-full"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => dispatch(setIsPlaying(false))}
            />

            {activeSubtitles.map((subtitle) => (
              <div
                key={subtitle.id}
                className="absolute"
                style={{
                  left: `${subtitle.position.x}%`,
                  top: `${subtitle.position.y}%`,
                  transform: "translate(-50%, -50%)",
                  fontFamily: subtitle.style.fontFamily,
                  fontSize: `${subtitle.style.fontSize}px`,
                  color: subtitle.style.color,
                  backgroundColor: `${subtitle.style.backgroundColor}${Math.round(subtitle.style.opacity * 255)
                    .toString(16)
                    .padStart(2, "0")}`,
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                  textAlign: subtitle.style.textAlign || "center",
                  maxWidth: "80%",
                  zIndex: 10,
                }}
              >
                {subtitle.text}
              </div>
            ))}

            {/* Image Overlays */}
            {activeImages.map((image) => (
              <div
                key={image.id}
                className="absolute"
                style={{
                  left: `${image.position.x}%`,
                  top: `${image.position.y}%`,
                  transform: `translate(-50%, -50%) rotate(${image.rotation}deg)`,
                  width: `${image.size.width}px`,
                  height: `${image.size.height}px`,
                  opacity: image.opacity,
                  zIndex: image.zIndex,
                }}
              >
                <img src={image.url || "/placeholder.svg"} alt="Overlay" className="w-full h-full object-contain" />
              </div>
            ))}

            {/* Text Overlays */}
            {activeTexts.map((text) => (
              <div
                key={text.id}
                className="absolute"
                style={{
                  left: `${text.position.x}%`,
                  top: `${text.position.y}%`,
                  transform: "translate(-50%, -50%)",
                  fontFamily: text.style.fontFamily,
                  fontSize: `${text.style.fontSize}px`,
                  color: text.style.color,
                  backgroundColor: `${text.style.backgroundColor}${Math.round(text.style.opacity * 255)
                    .toString(16)
                    .padStart(2, "0")}`,
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                  textAlign: "center",
                  maxWidth: "80%",
                  fontWeight: text.style.bold ? "bold" : "normal",
                  fontStyle: text.style.italic ? "italic" : "normal",
                  textDecoration: text.style.underline ? "underline" : "none",
                  zIndex: text.zIndex,
                }}
              >
                {text.text}
              </div>
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center h-full w-[70vh] text-white">
            <p>Upload a video to preview</p>
          </div>
        )}

        {/* Fullscreen button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-white bg-black/30 hover:bg-black/50"
          onClick={handleFullscreen}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
