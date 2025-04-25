"use client"

import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { addAudioTrack, removeAudioTrack, updateAudioTrack, AudioTrack } from "@/lib/store/slices/audioSlice"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AudioUpload from "./audio-upload"
import AudioTiming from "./audio-timing"
import AudioControls from "./audio-controls"
import { Clock, Volume2, Music } from "lucide-react"

export default function AudioPanel() {
    const dispatch = useAppDispatch()
    const { videoUrl, duration } = useAppSelector((state) => state.video)
    const { tracks } = useAppSelector((state) => state.audio)
    const [audioFiles, setAudioFiles] = useState<AudioTrack[]>([])
    const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentPlayingTime, setCurrentPlayingTime] = useState(0)
    const [soloTrackId, setSoloTrackId] = useState<string | null>(null)

    // Handle uploaded audio files
    const handleAudioUpload = (newFiles: AudioTrack[]) => {
        // If this is a complete replacement of all files
        if (newFiles.every(file =>
            audioFiles.some(existingFile => existingFile.id === file.id))) {
            // This is just an update to existing files (like duration updates)
            setAudioFiles(newFiles);
            return;
        }

        // If this contains new files to add
        // Find files that don't exist in the current state
        const filesToAdd = newFiles.filter(file =>
            !audioFiles.some(existingFile => existingFile.id === file.id)
        );

        // Add only the new files
        if (filesToAdd.length > 0) {
            setAudioFiles(prev => [...prev, ...filesToAdd]);

            // Select the first new file if no file is currently selected
            if (!selectedAudioId && filesToAdd.length > 0) {
                setSelectedAudioId(filesToAdd[0].id);
            }
        }
    }

    // Handle removing audio
    const handleRemoveAudio = (id: string) => {
        setAudioFiles(prev => prev.filter(audio => audio.id !== id))

        if (selectedAudioId === id) {
            const remaining = audioFiles.filter(audio => audio.id !== id)
            setSelectedAudioId(remaining.length > 0 ? remaining[0].id : null)
        }

        if (soloTrackId === id) {
            setSoloTrackId(null)
        }
    }

    // Handle volume change
    const handleVolumeChange = (id: string, volume: number) => {
        setAudioFiles(prev =>
            prev.map(audio =>
                audio.id === id ? { ...audio, volume: volume / 100 } : audio
            )
        )
    }

    // Handle mute toggle
    const handleToggleMute = (id: string) => {
        setAudioFiles(prev =>
            prev.map(audio =>
                audio.id === id ? { ...audio, isMuted: !audio.isMuted } : audio
            )
        )
    }

    // Handle timing updates
    const handleUpdateTiming = (id: string, startTime: number, endTime: number) => {
        setAudioFiles(prev =>
            prev.map(audio =>
                audio.id === id ? { ...audio, startTime, endTime } : audio
            )
        )
    }

    // Add to timeline
    const handleAddToTimeline = () => {
        if (selectedAudioId) {
            const selectedTrack = audioFiles.find(track => track.id === selectedAudioId)
            if (selectedTrack) {
                dispatch(addAudioTrack(selectedTrack))
            }
        }
    }

    // Get the selected audio track
    const selectedTrack = selectedAudioId
        ? audioFiles.find(audio => audio.id === selectedAudioId)
        : null

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Music className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-medium">Audio Manager</h2>
            </div>

            <Tabs defaultValue="upload">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="timing" disabled={!selectedTrack}>Timing</TabsTrigger>
                    <TabsTrigger value="controls" disabled={!selectedTrack}>Controls</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                    <AudioUpload
                        onAudioUpload={handleAudioUpload}
                        audioFiles={audioFiles}
                        onRemoveAudio={handleRemoveAudio}
                        selectedAudioId={selectedAudioId}
                        setSelectedAudioId={setSelectedAudioId}
                    />
                </TabsContent>

                <TabsContent value="timing" className="space-y-4 pt-4">
                    {selectedTrack ? (
                        <AudioTiming
                            track={selectedTrack}
                            onUpdateTiming={handleUpdateTiming}
                            videoUrl={videoUrl}
                            videoDuration={duration || 60}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-32 border rounded-md bg-background text-gray-400">
                            <div className="text-center">
                                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Select an audio track to adjust timing</p>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="controls" className="space-y-4 pt-4">
                    {selectedTrack ? (
                        <div className="space-y-4">
                            <AudioControls
                                track={selectedTrack}
                                isPlaying={isPlaying}
                                setIsPlaying={setIsPlaying}
                                currentTime={currentPlayingTime}
                                setCurrentTime={setCurrentPlayingTime}
                                onVolumeChange={handleVolumeChange}
                                onToggleMute={handleToggleMute}
                                onRemove={handleRemoveAudio}
                                isSoloed={soloTrackId === selectedTrack.id}
                                isActive={soloTrackId === null || soloTrackId === selectedTrack.id}
                            />

                            <Button
                                onClick={handleAddToTimeline}
                                className="w-full"
                            >
                                Add to Timeline
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-32 border rounded-md bg-background text-gray-400">
                            <div className="text-center">
                                <Volume2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Select an audio track to adjust volume</p>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
