"use client";

import { Camera, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import * as React from "react";
import { useDropzone } from "react-dropzone";

import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  /** Upload handler. Receives the dropped/selected file. */
  onUpload: (file: File) => Promise<void>;
  /** Optional remove handler. When omitted, the remove button is hidden. */
  onRemove?: () => Promise<void>;
  /** Whether an image is currently displayed (controls the empty-state hint and Remove button). */
  hasImage: boolean;
  /** "rect" for covers, "circle" for avatars. Controls border-radius and overlay shape. */
  shape?: "rect" | "circle";
  /** Compact mode renders icon-only buttons (good for small avatar circle). */
  compact?: boolean;
  /** Label for the change/upload action. */
  changeLabel?: string;
  /** Hint shown on an empty rectangular dropzone. */
  emptyHint?: string;
  /** className for the dropzone root. */
  className?: string;
  /** className for the absolutely-positioned action bar (Change / Remove). */
  actionsClassName?: string;
  /** Children are rendered inside the dropzone (preview content). */
  children?: React.ReactNode;
}

/**
 * Wraps any preview content (image, avatar) with drag-and-drop upload support.
 *
 *  - Desktop: drag a file anywhere over the preview area to upload.
 *  - Mobile: tap the "Change" button to open the native picker.
 *  - Shows a Remove button when `hasImage` and `onRemove` are provided.
 *  - Visually highlights on drag-over and shows a centered "Drop to upload" overlay.
 *  - Manages its own busy state so all three actions (drop / change / remove) coordinate.
 */
export function ImageDropzone({
  onUpload,
  onRemove,
  hasImage,
  shape = "rect",
  compact = false,
  changeLabel = "Change",
  emptyHint = "Drop an image or tap change",
  className,
  actionsClassName,
  children,
}: ImageDropzoneProps) {
  const [busy, setBusy] = React.useState(false);

  const runUpload = React.useCallback(
    async (file: File) => {
      setBusy(true);
      try {
        await onUpload(file);
      } finally {
        setBusy(false);
      }
    },
    [onUpload],
  );

  const runRemove = React.useCallback(async () => {
    if (!onRemove) return;
    setBusy(true);
    try {
      await onRemove();
    } finally {
      setBusy(false);
    }
  }, [onRemove]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    // Use explicit buttons rather than letting the whole area trigger a picker —
    // safer on mobile (no accidental taps) and lets us keep child interactions clickable.
    noClick: true,
    noKeyboard: true,
    disabled: busy,
    onDrop: (files) => {
      const file = files[0];
      if (file) void runUpload(file);
    },
  });

  const roundedClass = shape === "circle" ? "rounded-full" : "rounded-2xl";

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative outline-none transition",
        roundedClass,
        isDragActive && "ring-2 ring-brand-500 ring-offset-2 ring-offset-surface",
        className,
      )}
      data-busy={busy ? "true" : undefined}
    >
      <input {...getInputProps()} />

      {children}

      {/* Empty-state hint (rectangular only, hidden on small screens) */}
      {!hasImage && !isDragActive && !busy && shape === "rect" && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 hidden items-center justify-center text-xs font-medium text-white/85 sm:flex",
            roundedClass,
          )}
        >
          <ImagePlus className="mr-1.5 h-4 w-4" />
          {emptyHint}
        </div>
      )}

      {/* Drag-active overlay */}
      {isDragActive && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-brand-600/80 text-xs font-semibold text-white",
            roundedClass,
          )}
        >
          <Upload className="mr-1.5 h-4 w-4" />
          Drop to upload
        </div>
      )}

      {/* Busy overlay */}
      {busy && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 text-white",
            roundedClass,
          )}
        >
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {/* Action bar */}
      <div
        className={cn(
          "absolute z-10 flex gap-1.5",
          actionsClassName ?? "right-3 top-3",
        )}
      >
        <button
          type="button"
          onClick={open}
          disabled={busy}
          aria-label={changeLabel}
          title={changeLabel}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/95 px-3 py-1.5 text-xs font-medium shadow-soft transition hover:bg-surface disabled:opacity-60",
            compact && "h-8 w-8 justify-center p-0",
          )}
        >
          <Camera className="h-3.5 w-3.5" />
          {!compact && (busy ? "Uploading…" : changeLabel)}
        </button>

        {hasImage && onRemove && (
          <button
            type="button"
            onClick={() => void runRemove()}
            disabled={busy}
            aria-label="Remove image"
            title="Remove image"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/95 px-3 py-1.5 text-xs font-medium text-red-600 shadow-soft transition hover:bg-red-50 disabled:opacity-60",
              compact && "h-8 w-8 justify-center p-0",
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {!compact && "Remove"}
          </button>
        )}
      </div>
    </div>
  );
}
