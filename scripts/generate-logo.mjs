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

/** Remove near-black background pixels so the mark works on light surfaces. */
async function prepareMark() {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r < 72 && g < 72 && b < 72) {
      data[i + 3] = 0;
    }
  }

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
  return Buffer.from(`
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
    </svg>
  `);
}

async function buildLogo({ color, outName }) {
  const mark = await sharp(markPath)
    .resize(MARK_SIZE, MARK_SIZE, { fit: "contain" })
    .png()
    .toBuffer();

  const textMeta = await sharp(wordmarkSvg(color)).png().toBuffer();
  const textTrimmed = await sharp(textMeta)
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
      background: { r: 0, g: 0, b: 0, alpha: 0 },
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
