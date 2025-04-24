"use client"

import { ChevronLeft, ChevronRight, Music, Play, ScissorsLineDashed, ZoomIn, ZoomOutIcon } from "lucide-react"
import { Button } from "../ui/button"

export default function EmptyTimeline() {

  return (
    <div className="w-full timeline-container bg-white border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Play className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-mono ml-2">
            00:00 / 00:00
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ZoomOutIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-row">
        <div className="flex flex-col justify-end gap-6 mb-1 w-12 bg-white border-r">
          <div className="h-16 flex items-center justify-center"><ScissorsLineDashed size={24} className="text-gray-500" /></div>
          <div className="h-16 flex items-center justify-center"><Music size={20} className="text-gray-500" /></div>
        </div>

        <div className="overflow-x-auto flex-1 relative">
          <div className="relative">

            <div className="flex flex-col">

              <div className="flex relative h-24 border-b bg-gray-100">
                <div className="flex-1 relative h-full overflow-hidden">

                </div>
              </div>

              <div className="flex items-center h-16 relative bg-gray-50 px-4">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
