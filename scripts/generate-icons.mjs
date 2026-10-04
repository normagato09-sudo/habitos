// Genera los iconos PNG de la app a partir de los SVG de assets/.
// Uso: npm run icons
import { copyFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

const rounded = "assets/icon.svg";
const fullBleed = "assets/icon-full-bleed.svg";

const outputs = [
  { src: rounded, size: 192, out: "public/icons/icon-192.png" },
  { src: rounded, size: 512, out: "public/icons/icon-512.png" },
  { src: fullBleed, size: 512, out: "public/icons/maskable-512.png" },
  { src: fullBleed, size: 180, out: "app/apple-icon.png" },
];

await mkdir("public/icons", { recursive: true });
for (const { src, size, out } of outputs) {
  await sharp(src, { density: 300 }).resize(size, size).png().toFile(out);
  console.log(`✓ ${out} (${size}×${size})`);
}
await copyFile(rounded, "app/icon.svg");
console.log("✓ app/icon.svg (favicon)");
