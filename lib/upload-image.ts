"use client";

import imageCompression, {
  type Options as BrowserImageCompressionOptions,
} from "browser-image-compression";

/**
 * Reusable client-side image compression helpers.
 *
 * All helpers:
 *   - convert the source image to WebP
 *   - downscale to a sensible max dimension
 *   - cap the output size (best-effort)
 *   - run the work in a web worker when available
 *   - return an optimized `File` (with a `.webp` extension)
 *
 * Usage:
 *   const optimized = await compressAvatar(file);
 *   await supabase.storage.from("avatars").upload(path, optimized, {
 *     contentType: "image/webp",
 *   });
 */

export interface CompressOptions {
  /** Largest dimension (width or height) in pixels. */
  maxWidthOrHeight: number;
  /** Hard cap for output file size in MB (best-effort). */
  maxSizeMB: number;
  /** WebP quality between 0 and 1. */
  quality: number;
}

const DEFAULTS = {
  avatar:    { maxWidthOrHeight: 512,  maxSizeMB: 0.3, quality: 0.82 },
  cover:     { maxWidthOrHeight: 1600, maxSizeMB: 1.2, quality: 0.82 },
  chatImage: { maxWidthOrHeight: 1280, maxSizeMB: 0.8, quality: 0.8  },
} as const satisfies Record<string, CompressOptions>;

/**
 * Replace the file extension with `.webp`. Falls back to "image.webp".
 */
function toWebpFilename(name: string | undefined): string {
  if (!name) return "image.webp";
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const safe = base.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "") || "image";
  return `${safe}.webp`;
}

/**
 * Compress an image `File`, convert to WebP, and return a new `File`.
 *
 * Throws if the input is not an image or compression fails.
 */
export async function compressImage(
  file: File,
  options: CompressOptions,
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are supported.");
  }

  const compressionOptions: BrowserImageCompressionOptions = {
    maxSizeMB: options.maxSizeMB,
    maxWidthOrHeight: options.maxWidthOrHeight,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: options.quality,
    alwaysKeepResolution: false,
  };

  const compressedBlob = await imageCompression(file, compressionOptions);

  return new File([compressedBlob], toWebpFilename(file.name), {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

/** Compress a profile avatar (square, ≤512px, ~300KB). */
export function compressAvatar(file: File): Promise<File> {
  return compressImage(file, DEFAULTS.avatar);
}

/** Compress a profile cover image (wide, ≤1600px, ~1.2MB). */
export function compressCover(file: File): Promise<File> {
  return compressImage(file, DEFAULTS.cover);
}

/** Compress an image shared inside a chat message (≤1280px, ~800KB). */
export function compressChatImage(file: File): Promise<File> {
  return compressImage(file, DEFAULTS.chatImage);
}
