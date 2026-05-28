/**
 * Generates PWA icon PNGs from public/logo-mark.png.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const markPath = join(root, "public", "logo-mark.png");
const outDir = join(root, "public", "icons");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

async function main() {
  await mkdir(outDir, { recursive: true });

  for (const size of sizes) {
    const out = join(outDir, `icon-${size}x${size}.png`);
    await sharp(markPath)
      .resize(size, size, { fit: "contain", background: TRANSPARENT })
      .png()
      .toFile(out);
    console.log(`  ✓ ${out}`);
  }

  await sharp(markPath)
    .resize(180, 180, { fit: "contain", background: TRANSPARENT })
    .png()
    .toFile(join(outDir, "apple-touch-icon.png"));
  console.log("  ✓ apple-touch-icon.png");

  await sharp(markPath)
    .resize(32, 32, { fit: "contain", background: TRANSPARENT })
    .png()
    .toFile(join(root, "public", "favicon.png"));
  console.log("  ✓ favicon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
