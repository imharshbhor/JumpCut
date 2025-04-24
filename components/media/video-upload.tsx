"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { addVideoFile, setThumbnail, setVideoDuration, setProcessingComplete, setSnapshots, setSnapshotsLoading, } from "@/lib/store/slices/videoSlice"
import { generateThumbnail, generateVideoThumbnails } from "@/lib/utils/video-utils"
import { Progress } from "@/components/ui/progress"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VideoUpload() {

    const generateSnapshots = async (videoFile: HTMLVideoElement): Promise<any> => {
        dispatch(setSnapshotsLoading(true))
        const snapshots = await generateVideoThumbnails(videoFile)
        return snapshots
    }

    const dispatch = useAppDispatch()
    const { isProcessing } = useAppSelector((state) => state.video)
    const [uploadProgress, setUploadProgress] = useState(0)

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return

            // Process each file
            for (const file of acceptedFiles) {
                if (!file.type.startsWith("video/")) {
                    alert("Please upload valid video files only")
                    continue
                }

                // Create video URL first
                const videoUrl = URL.createObjectURL(file)

                // Prepare a more serializable version of the file
                const videoItem = {
                    id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    file, // File object needed but will be ignored in serialization
                    url: videoUrl,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                }

                // Add the video to the store
                dispatch(addVideoFile(videoItem))

                // Simulate upload progress
                let progress = 0
                const interval = setInterval(() => {
                    progress += 5
                    setUploadProgress(progress)
                    if (progress >= 100) {
                        clearInterval(interval)

                        generateThumbnail(file).then((thumbnailUrl) => {
                            dispatch(setThumbnail(thumbnailUrl))

                            const video = document.createElement("video")
                            video.preload = "metadata"
                            video.src = videoUrl

                            video.onloadedmetadata = async () => {
                                dispatch(setVideoDuration(video.duration))

                                const snapshots = await generateSnapshots(video)
                                dispatch(setSnapshots(snapshots))
                                dispatch(setProcessingComplete())
                            }
                        })
                    }
                }, 100)
            }
        },
        [dispatch]
    )

    const handleReset = () => {
        if (window.confirm("Are you sure you want to cancel this upload?")) {
            setUploadProgress(0)
            // If we were in the middle of processing, we should clean up
            if (isProcessing) {
                dispatch(setProcessingComplete())
            }
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "video/*": [],
        },
        // Remove maxFiles to allow multiple files
        disabled: isProcessing,
    })

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 h-[25vh] flex flex-col gap-1 text-center justify-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary/50"
                    }`}
            >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text- text-gray-600">
                    {isDragActive ? "Drop the videos here" : "Drag & drop video files here"}
                </p>
                <p className="text-xs text-gray-500">
                    You can upload multiple videos
                </p>
            </div>

            {isProcessing && (
                <div className="mt-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">Processing video...</p>
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleReset}>
                            Cancel
                        </Button>
                    </div>
                    <Progress value={uploadProgress} className="h-1 mt-1" />
                </div>
            )}
        </div>
    )
}
