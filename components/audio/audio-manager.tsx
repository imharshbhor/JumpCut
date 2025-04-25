"use client"

import { useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { addAudioTrack, removeAudioTrack, updateAudioTrack, setMasterVolume } from "@/lib/store/slices/audioSlice"
import { generateWaveform } from "@/lib/utils/video-utils"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Volume2, VolumeX, Trash2, Music, Plus } from "lucide-react"
import AudioWaveform from "./audio-waveform"

export default function AudioManager() {
    const dispatch = useAppDispatch()
    const { tracks, masterVolume } = useAppSelector((state) => state.audio)
    const { duration } = useAppSelector((state) => state.video)
    const [audioName, setAudioName] = useState("")

    const handleAddAudio = () => {
        // Mock adding audio track
        const newTrack = {
            id: uuidv4(),
            name: audioName || `Audio Track ${tracks.length + 1}`,
            url: "",
            startTime: 0,
            endTime: duration,
            volume: 1,
            isMuted: false,
            waveform: generateWaveform(duration),
        }

        dispatch(addAudioTrack(newTrack))
        setAudioName("")
    }

    const handleRemoveTrack = (id: string) => {
        dispatch(removeAudioTrack(id))
    }

    const handleToggleMute = (id: string, isMuted: boolean) => {
        dispatch(updateAudioTrack({ id, isMuted: !isMuted }))
    }

    const handleVolumeChange = (id: string, volume: number) => {
        dispatch(updateAudioTrack({ id, volume }))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Master Volume</h3>
                <div className="flex items-center space-x-2">
                    <Slider
                        value={[masterVolume * 100]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => dispatch(setMasterVolume(value[0] / 100))}
                        className="w-32"
                    />
                    <Button variant="ghost" size="icon" onClick={() => dispatch(setMasterVolume(masterVolume === 0 ? 1 : 0))}>
                        {masterVolume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {tracks.map((track) => (
                    <div key={track.id} className="border rounded-md p-3 bg-background">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{track.name}</span>
                            <div className="flex items-center space-x-2">
                                <Slider
                                    value={[track.volume * 100]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => handleVolumeChange(track.id, value[0] / 100)}
                                    className="w-24"
                                />
                                <Button variant="ghost" size="icon" onClick={() => handleToggleMute(track.id, track.isMuted)}>
                                    {track.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleRemoveTrack(track.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <AudioWaveform waveform={track.waveform} isMuted={track.isMuted} />
                    </div>
                ))}

                {tracks.length === 0 && (
                    <div className="flex items-center justify-center h-32 border rounded-md bg-background text-gray-400">
                        <div className="text-center">
                            <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No audio tracks added yet</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-2">
                <Input
                    placeholder="Audio track name"
                    value={audioName}
                    onChange={(e) => setAudioName(e.target.value)}
                    className="flex-1"
                />
                <Button onClick={handleAddAudio}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Track
                </Button>
            </div>
        </div>
    )
}
