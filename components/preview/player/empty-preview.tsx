"use client"

export default function EmptyVideoPreview() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center">
      <div
        className="relative flex h-[50vh] bg-black rounded-sm overflow-hidden items-center justify-center"
      >
          <div className="flex items-center justify-center h-full w-[90vh] text-white">
            <div className="flex flex-col items-center justify-center">Upload a video to get started</div>
          </div>
      </div>
    </div>
  )
}
