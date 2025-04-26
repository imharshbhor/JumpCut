"use client"

import { Button } from "@/components/ui/button"
import { useDropzone } from "react-dropzone"
import { Music, Trash2 } from "lucide-react"
import { AudioTrack } from "@/lib/store/slices/audioSlice"

interface AudioUploadProps {
    onAudioUpload: (audio: AudioTrack[]) => void
    audioFiles: AudioTrack[]
    onRemoveAudio: (id: string) => void
    selectedAudioId: string | null
    setSelectedAudioId: (id: string | null) => void
}

export default function AudioUpload({
    onAudioUpload,
    audioFiles,
    onRemoveAudio,
    selectedAudioId,
    setSelectedAudioId
}: AudioUploadProps) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
        },
        onDrop: acceptedFiles => {
            const newAudioFiles: AudioTrack[] = acceptedFiles.map(file => {
                const id = crypto.randomUUID();
                const url = URL.createObjectURL(file);

                return {
                    id,
                    name: file.name,
                    url,
                    startTime: 0,
                    endTime: 30,
                    volume: 1,
                    isMuted: false,
                    waveform: Array(50).fill(0).map(() => Math.random() * 128 + 10)
                };
            });

            onAudioUpload(newAudioFiles);

            if (newAudioFiles.length > 0 && !selectedAudioId) {
                setSelectedAudioId(newAudioFiles[0].id);
            }

            acceptedFiles.forEach((file, index) => {
                const audio = new Audio();
                const id = newAudioFiles[index].id;

                audio.src = URL.createObjectURL(file);

                audio.onloadedmetadata = () => {
                    const fileToUpdate = audioFiles.find(f => f.id === id);

                    if (fileToUpdate) {
                        const updatedFile = {
                            ...fileToUpdate,
                            endTime: audio.duration
                        };

                        const updatedFiles = audioFiles.map(f =>
                            f.id === id ? updatedFile : f
                        );

                        onAudioUpload(updatedFiles);
                    }

                    URL.revokeObjectURL(audio.src);
                };
            });
        }
    });

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <>
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg mt-4 p-6 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary/50"
                    }`}
            >
                <input {...getInputProps()} />
                <Music className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-400">
                    {isDragActive ? "Drop the audio file here" : "Drag & drop audio files here, or click to select"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                    Supported formats: MP3, WAV, OGG, M4A
                </p>
            </div>

            <div className="space-y-3 mt-4">
                <h4 className="text-sm font-medium">Current Audio Files</h4>
                {audioFiles.length === 0 ? (
                    <div className="flex items-center justify-center h-32 border rounded-md bg-background text-gray-400">
                        <div className="text-center">
                            <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No audio files added yet</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {audioFiles.map(audio => (
                            <div
                                key={audio.id}
                                className={`flex items-center p-3 border rounded-md bg-background gap-3 group cursor-pointer ${selectedAudioId === audio.id ? "ring-2 ring-primary" : ""
                                    }`}
                                onClick={() => setSelectedAudioId(audio.id)}
                            >
                                <Music className="h-8 w-8 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{audio.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {formatTime(audio.startTime)} - {formatTime(audio.endTime)}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveAudio(audio.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
