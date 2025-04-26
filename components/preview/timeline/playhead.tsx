"use client";

import { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setCurrentTime } from "@/lib/store/slices/timelineSlice";
import { formatTime } from "@/lib/utils/video-utils";
import { useDrag } from "@use-gesture/react";

interface PlayheadProps {
  duration: number;
  getTimeFromMousePosition: (clientX: number) => number;
}

export default function Playhead({ duration, getTimeFromMousePosition }: PlayheadProps) {
  const dispatch = useAppDispatch();
  const { currentTime } = useAppSelector((state) => state.timeline);
  const playheadPosition = (currentTime / duration) * 100;
  const [isHovering, setIsHovering] = useState(false);

  const knobRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  const bindKnob = useDrag(
    ({ event }) => {
      const e = event as MouseEvent;
      const newTime = getTimeFromMousePosition(e.clientX);
      dispatch(setCurrentTime(Math.min(Math.max(newTime, 0), duration)));
    },
    { pointer: { touch: true } }
  );

  const bindLine = useDrag(
    ({ event }) => {
      const e = event as MouseEvent;
      const newTime = getTimeFromMousePosition(e.clientX);
      dispatch(setCurrentTime(Math.min(Math.max(newTime, 0), duration)));
    },
    { pointer: { touch: true } }
  );

  return (
    <div>
      <div
        {...bindLine()}
        ref={lineRef}
        className="absolute top-0 bottom-0 w-[3px] bg-red-500 z-20 cursor-ew-resize transition-transform duration-200 ease-in-out"
        style={{
          left: `${playheadPosition}%`,
          transform: `translate(35%) ${isHovering ? 'scale(1.5, 1)' : 'scale(1)'}`
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      />

      <div
        {...bindKnob()}
        ref={knobRef}
        className="absolute top-0 z-30 transition-transform duration-200 ease-in-out"
        style={{
          left: `${playheadPosition}%`,
          transform: `translate(-37%) ${isHovering ? 'scale(1.1)' : 'scale(1)'}`
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          className="w-5 h-5 border-b-[8px] border-b-transparent border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-red-600 cursor-ew-resize"
        ></div>

        {isHovering && (
          <div className="absolute text-xs text-white font-mono mt-[-1.2rem] -translate-x-[0.80rem] bg-red-700 px-1.5 py-0.5 rounded border border-red-500 text-center whitespace-nowrap cursor-ew-resize">
            {formatTime(currentTime)}
          </div>
        )}
      </div>
    </div>
  );
}
