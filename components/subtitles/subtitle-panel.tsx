"use client"

import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { addSubtitle, removeSubtitle } from "@/lib/store/slices/subtitleSlice"
import { v4 as uuidv4 } from "uuid"

import SubtitleForm from "./subtitle-form"
import SubtitleStyle from "./subtitle-style"
import SubtitleList from "./subtitle-list"
import TimingControls from "@/components/shared/timing-controls"
import { Text, Type } from "lucide-react"

export default function SubtitleEditor() {
    const dispatch = useAppDispatch()
    const { subtitles } = useAppSelector((state) => state.subtitle)
    const { currentTime } = useAppSelector((state) => state.timeline)
    const { duration } = useAppSelector((state) => state.video)
    const [text, setText] = useState("")
    const [fontFamily, setFontFamily] = useState("Arial")
    const [fontSize, setFontSize] = useState(16)
    const [color, setColor] = useState("#ffffff")
    const [bgColor, setBgColor] = useState("#000000")
    const [opacity, setOpacity] = useState(80)
    const [alignment, setAlignment] = useState("center")
    const [startTime, setStartTime] = useState(currentTime)
    const [endTime, setEndTime] = useState(currentTime + 5)

    // Update start time when current time changes
    useEffect(() => {
        setStartTime(parseFloat(currentTime.toFixed(2)))
        setEndTime(parseFloat(Math.min(currentTime + 5, duration).toFixed(2)))
    }, [currentTime, duration])

    const handleAddSubtitle = () => {
        if (!text.trim()) return

        const newSubtitle = {
            id: uuidv4(),
            text,
            startTime,
            endTime,
            position: { x: 50, y: 80 }, // Default position (percentage)
            style: {
                fontFamily,
                fontSize,
                color,
                backgroundColor: bgColor,
                opacity: opacity / 100,
                textAlign: alignment,
            },
        }

        dispatch(addSubtitle(newSubtitle))
        setText("")
    }

    const handleRemoveSubtitle = (id: string) => {
        dispatch(removeSubtitle(id))
    }

    return (
        <div className="space-y-6">
             <div className="flex items-center gap-2">
                <Type className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-medium">Subtitles Manager</h2>
            </div>
            <div className="space-y-5">
                <SubtitleForm
                    text={text}
                    setText={setText}
                    handleAddSubtitle={handleAddSubtitle}
                />

                <TimingControls
                    startTime={startTime}
                    endTime={endTime}
                    duration={duration}
                    onStartTimeChange={setStartTime}
                    onEndTimeChange={setEndTime}
                    currentTime={currentTime}
                    showSetCurrentTimeButtons={true}
                />

                <SubtitleStyle
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    color={color}
                    bgColor={bgColor}
                    opacity={opacity}
                    alignment={alignment}
                    setFontFamily={setFontFamily}
                    setFontSize={setFontSize}
                    setColor={setColor}
                    setBgColor={setBgColor}
                    setOpacity={setOpacity}
                    setAlignment={setAlignment}
                />
            </div>

            <div className="pb-4">
                <SubtitleList
                    subtitles={subtitles}
                    handleRemoveSubtitle={handleRemoveSubtitle}
                />
            </div>
        </div>
    )
}
