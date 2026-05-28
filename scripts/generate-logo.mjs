/**
 * Prepares the transparent lion mark from public/logo-source.png.
 * Run: node scripts/generate-logo.mjs
 */
import { access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sourcePath = join(root, "public", "logo-source.png");
const markPath = join(root, "public", "logo-mark.png");

function isBlackPixel(r, g, b) {
  return r < 80 && g < 80 && b < 80;
}

function isWhitePixel(r, g, b) {
  return r > 240 && g > 240 && b > 240;
}

/** Flood-fill a background color connected to the image edges. */
function floodFillEdges(data, width, height, matches) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;

    const offset = idx * 4;
    if (!matches(data[offset], data[offset + 1], data[offset + 2])) return;

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

    data[idx * 4 + 3] = 0;

    const x = idx % width;
    const y = Math.floor(idx / width);
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }
}

/** Make black/white backgrounds transparent so the mark works on any theme. */
function makeTransparent(data) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Tribal negative space + black matte
    if (isBlackPixel(r, g, b)) {
      data[i + 3] = 0;
    }
  }
}

async function main() {
  await access(sourcePath);

  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  makeTransparent(data);
  floodFillEdges(data, info.width, info.height, isWhitePixel);
  floodFillEdges(data, info.width, info.height, isBlackPixel);

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 12 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(markPath);

  console.log("  ✓ public/logo-mark.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
