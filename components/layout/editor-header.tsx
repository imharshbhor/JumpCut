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
import { Save, Share2, Trash2, Upload } from "lucide-react"
import { useState } from 'react'

interface EditorHeaderProps {
  onReset: () => void
}

export default function EditorHeader({ onReset }: EditorHeaderProps) {
  const { videoUrl } = useAppSelector((state) => state.video)

  return (
    <div className="h-[7.7vh] border-b bg-white flex items-center justify-end px-4">
      <div className="flex items-center space-x-2">
        {videoUrl && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
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
                <Button variant="outline" size="sm" onClick={() => {}}>
                  Cancel
                </Button>
                <Button size="sm" variant="destructive" onClick={onReset}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <Button variant="outline" size="sm" disabled={!videoUrl}>
          <Save className="h-4 w-4" />
          Save
        </Button>
        <Button variant="outline" size="sm" disabled={!videoUrl}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button size="sm" disabled={!videoUrl}>
          <Upload className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  )
}
