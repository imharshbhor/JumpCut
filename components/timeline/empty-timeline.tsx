"use client"

import { ChevronLeft, ChevronRight, Music, Play, ScissorsLineDashed, ZoomIn, ZoomOutIcon } from "lucide-react"
import { Button } from "../ui/button"

export default function EmptyTimeline() {

    return (
        <div className="w-full border rounded-lg overflow-hidden">

            <div className="flex flex-row">

                <div className="overflow-x-auto flex-1 relative">
                    <div className="relative">

                        <div className="flex flex-col">

                            <div className="flex relative h-24 bg-gray-50 dark:bg-gray-800">
                                <div className="flex-1 relative h-full overflow-hidden">

                                </div>
                            </div>

                            <div className="flex items-center h-24 relative bg-gray-50 dark:bg-gray-800 px-4">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
