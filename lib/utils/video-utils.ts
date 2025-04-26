export const generateThumbnail = async (videoFile: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.src = URL.createObjectURL(videoFile)
    video.currentTime = 1

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
      const thumbnail = canvas.toDataURL("image/jpeg")
      URL.revokeObjectURL(video.src)
      resolve(thumbnail)
    }
  })
}

export const generateVideoThumbnails = async (video: HTMLVideoElement) => {
    if (!video) return

    const newSnapshots: { time: number; url: string }[] = []
    const duration = video.duration
    const snapshotCount = Math.max(10, Math.ceil(duration / 5))

    const currentTime = video.currentTime
    const wasPlaying = !video.paused
    if (wasPlaying) video.pause()

    const canvas = document.createElement("canvas")
    canvas.width = 160
    canvas.height = 90
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    for (let i = 0; i < snapshotCount; i++) {
      const time = (duration / snapshotCount) * i
      video.currentTime = time

      await new Promise<void>((resolve) => {
        const handleSeeked = () => {
          video.removeEventListener("seeked", handleSeeked)
          resolve()
        }
        video.addEventListener("seeked", handleSeeked)
      })

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const thumbnailUrl = canvas.toDataURL("image/jpeg")

      newSnapshots.push({ time, url: thumbnailUrl })
    }

    video.currentTime = currentTime
    if (wasPlaying) video.play()

    return newSnapshots
  }

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

export const generateSceneThumbnails = (videoUrl: string, duration: number, count = 5): Promise<string[]> => {
  return new Promise((resolve) => {
    const thumbnails: string[] = []
    const video = document.createElement("video")
    video.src = videoUrl

    let processed = 0

    for (let i = 0; i < count; i++) {
      const time = (duration / count) * i
      video.currentTime = time

      video.onseeked = () => {
        const canvas = document.createElement("canvas")
        canvas.width = 160
        canvas.height = 90
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
        thumbnails.push(canvas.toDataURL("image/jpeg"))

        processed++
        if (processed === count) {
          URL.revokeObjectURL(video.src)
          resolve(thumbnails)
        }
      }
    }
  })
}
