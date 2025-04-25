"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useAppSelector } from "@/lib/store/hooks"
import { Moon, Save, Share2, Sun, Trash2, Upload } from "lucide-react"
import { useState, useEffect } from 'react'
import { useTheme } from "next-themes"
import ExportPanel from "@/components/export/export-panel"

interface EditorHeaderProps {
    onReset: () => void
}

export default function EditorHeader({ onReset }: EditorHeaderProps) {
    const { videoUrl } = useAppSelector((state) => state.video)
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [exportDialogOpen, setExportDialogOpen] = useState(false)

    // Only show theme toggle after component mounts to avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="h-[7.7vh] bg-gray-200/40 dark:bg-gray-800/40 flex items-center justify-end px-4">
   <div className="flex items-center space-x-2">
                {/* Theme toggle button */}
                {mounted && (
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Toggle Dark Mode"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="mr-2"
                    >
                        {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
                    </Button>
                )}
            </div>
            <div className="flex items-center space-x-2">
                {videoUrl && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Video</DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                                Are you sure you want to delete this video?
                            </DialogDescription>
                            <DialogFooter>
                                <Button variant="outline" size="sm" onClick={() => { }}>
                                    Cancel
                                </Button>
                                <Button size="sm" variant="destructive" onClick={onReset}>
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
                <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="default" disabled={!videoUrl}>
                            <Upload className="h-4 w-4" />
                            Export
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <ExportPanel />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
