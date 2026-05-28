/**
 * Builds logo mark and horizontal logo PNGs from public/logo-source.png.
 * Run: node scripts/generate-logo.mjs
 */
import { access, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sourcePath = join(root, "public", "logo-source.png");
const markPath = join(root, "public", "logo-mark.png");
const wordmark = "The Legasi";

const MARK_SIZE = 36;
const GAP = 10;
const TEXT_COLOR = "#0f172a";
const TEXT_COLOR_INVERTED = "#ffffff";
const FONT = "Inter, Arial, Helvetica, sans-serif";
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

function isBackgroundPixel(r, g, b) {
  return r < 80 && g < 80 && b < 80;
}

/** Flood-fill outer black background from image edges; keeps true transparency. */
function removeOuterBackground(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;

    const offset = idx * 4;
    if (!isBackgroundPixel(data[offset], data[offset + 1], data[offset + 2])) {
      return;
    }

    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop();
    if (idx === undefined) break;

    const offset = idx * 4;
    data[offset + 3] = 0;

    const x = idx % width;
    const y = Math.floor(idx / width);
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }
}

async function prepareMark() {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  removeOuterBackground(data, info.width, info.height);

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 12 })
    .png()
    .toFile(markPath);

  console.log("  ✓ public/logo-mark.png");
}

function wordmarkSvg(color) {
  const escaped = wordmark
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="${MARK_SIZE}">
  <text
    x="0"
    y="24"
    fill="${color}"
    font-family="${FONT}"
    font-size="16"
    font-weight="600"
    letter-spacing="-0.02em"
  >${escaped}</text>
</svg>`);
}

async function buildLogo({ color, outName }) {
  const mark = await sharp(markPath)
    .resize(MARK_SIZE, MARK_SIZE, { fit: "contain", background: TRANSPARENT })
    .png()
    .toBuffer();

  const textTrimmed = await sharp(wordmarkSvg(color))
    .resize(160, MARK_SIZE, { fit: "contain", background: TRANSPARENT })
    .trim({ threshold: 40 })
    .png()
    .toBuffer();

  const { width: textWidth, height: textHeight } = await sharp(textTrimmed).metadata();

  const width = MARK_SIZE + GAP + (textWidth ?? 120);
  const height = Math.max(MARK_SIZE, textHeight ?? MARK_SIZE);
  const textTop = Math.round((height - (textHeight ?? MARK_SIZE)) / 2);
  const markTop = Math.round((height - MARK_SIZE) / 2);

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: TRANSPARENT,
    },
  })
    .composite([
      { input: mark, left: 0, top: markTop },
      { input: textTrimmed, left: MARK_SIZE + GAP, top: textTop },
    ])
    .png()
    .toFile(join(root, "public", outName));

  console.log(`  ✓ public/${outName} (${width}x${height})`);
  return { width, height };
}

async function main() {
  await access(sourcePath);
  await prepareMark();

  const full = await buildLogo({ color: TEXT_COLOR, outName: "logo.png" });
  await buildLogo({ color: TEXT_COLOR_INVERTED, outName: "logo-inverted.png" });

  await writeFile(
    join(root, "public", "logo.meta.json"),
    `${JSON.stringify(full, null, 2)}\n`,
  );
  console.log("  ✓ public/logo.meta.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
