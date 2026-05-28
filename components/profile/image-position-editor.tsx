"use client";

import * as React from "react";

import {
  clampProfileImagePosition,
  DEFAULT_PROFILE_IMAGE_POSITION,
} from "@/lib/profile-image-position";
import { cn } from "@/lib/utils";

interface ImagePositionEditorProps {
  positionX?: number;
  positionY?: number;
  onPositionChange: (x: number, y: number) => void;
  onPositionCommit?: (x: number, y: number) => void;
  editable?: boolean;
  shape?: "rect" | "circle";
  className?: string;
  children: React.ReactNode;
}

export function ImagePositionEditor({
  positionX = DEFAULT_PROFILE_IMAGE_POSITION,
  positionY = DEFAULT_PROFILE_IMAGE_POSITION,
  onPositionChange,
  onPositionCommit,
  editable = false,
  shape = "rect",
  className,
  children,
}: ImagePositionEditorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);
  const latestRef = React.useRef({ x: positionX, y: positionY });
  const [dragging, setDragging] = React.useState(false);

  React.useEffect(() => {
    latestRef.current = { x: positionX, y: positionY };
  }, [positionX, positionY]);

  const finishDrag = React.useCallback(
    (target: HTMLElement, pointerId: number) => {
      if (target.hasPointerCapture(pointerId)) {
        target.releasePointerCapture(pointerId);
      }
      dragRef.current = null;
      setDragging(false);
      onPositionCommit?.(latestRef.current.x, latestRef.current.y);
    },
    [onPositionCommit],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!editable || event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosX: positionX,
      startPosY: positionY,
    };
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const container = containerRef.current;
    if (!drag || !container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaX = ((event.clientX - drag.startX) / rect.width) * 100;
    const deltaY = ((event.clientY - drag.startY) / rect.height) * 100;
    const next = {
      x: clampProfileImagePosition(drag.startPosX - deltaX),
      y: clampProfileImagePosition(drag.startPosY - deltaY),
    };

    latestRef.current = next;
    onPositionChange(next.x, next.y);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    finishDrag(event.currentTarget, event.pointerId);
  };

  const onPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    finishDrag(event.currentTarget, event.pointerId);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative overflow-hidden touch-none",
        shape === "circle" ? "rounded-full" : "rounded-2xl",
        editable && "cursor-grab active:cursor-grabbing",
        dragging && "ring-2 ring-brand-500/60 ring-offset-2 ring-offset-surface",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {children}
      {editable && !dragging && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/55 to-transparent px-2 py-1.5 text-center text-[10px] font-medium text-white/95 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100",
            shape === "circle" && "rounded-b-full",
          )}
        >
          Drag to reposition
        </div>
      )}
    </div>
  );
}
