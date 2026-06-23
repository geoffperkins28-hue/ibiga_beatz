// Generates PWA icons from the Ibiga Beatz brand mark (green + black headphones).
//   node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "fs";

const GREEN = "#1DB954";
const headphones =
  '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>';

// glyph scaled & centered in a `size` canvas (viewBox is 24×24, centered at 12,12)
function glyph(size, scale, stroke = "#000000") {
  const t = `translate(${size / 2},${size / 2}) scale(${scale}) translate(-12,-12)`;
  return `<g transform="${t}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${headphones}</g>`;
}

function rounded(size) {
  const r = Math.round(size * 0.22);
  const s = size * (size <= 192 ? 6.5 : 17);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${r}" fill="${GREEN}"/>
    ${glyph(size, size / 24 * 0.42)}
  </svg>`;
}

function maskable(size) {
  // full-bleed bg, glyph kept inside the ~80% safe area
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${GREEN}"/>
    ${glyph(size, size / 24 * 0.34)}
  </svg>`;
}

mkdirSync("public", { recursive: true });
mkdirSync("app", { recursive: true });

const png = (svg) => sharp(Buffer.from(svg)).png();

await png(rounded(192)).toFile("public/icon-192.png");
await png(rounded(512)).toFile("public/icon-512.png");
await png(maskable(512)).toFile("public/icon-maskable.png");
await png(rounded(180)).toFile("public/apple-touch-icon.png");
await png(rounded(512)).toFile("app/icon.png");

console.log("Icons generated: public/icon-192.png, icon-512.png, icon-maskable.png, apple-touch-icon.png, app/icon.png");
