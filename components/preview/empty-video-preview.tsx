"use client"

export default function EmptyVideoPreview() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center">
      <div
        className="relative flex h-[48vh] bg-black rounded-lg overflow-hidden items-center justify-center"
      >
          <div className="flex items-center justify-center h-full w-[80vh] text-white">
            <p>Upload a video to preview</p>
          </div>
      </div>
    </div>
  )
}
