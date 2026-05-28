/**
 * Generates PWA icon PNGs from public/icon.svg.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "icon.svg");
const outDir = join(root, "public", "icons");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function main() {
  const svg = await readFile(svgPath);
  await mkdir(outDir, { recursive: true });

  for (const size of sizes) {
    const out = join(outDir, `icon-${size}x${size}.png`);
    await sharp(svg).resize(size, size).png().toFile(out);
    console.log(`  ✓ ${out}`);
  }

  // Apple touch icon
  await sharp(svg).resize(180, 180).png().toFile(join(outDir, "apple-touch-icon.png"));
  console.log(`  ✓ apple-touch-icon.png`);

  // Favicon
  await sharp(svg).resize(32, 32).png().toFile(join(root, "public", "favicon.png"));
  console.log(`  ✓ favicon.png`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
