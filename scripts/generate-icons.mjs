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

// 1200×630 Open Graph / link-preview image
function og() {
  const badge = 180;
  const bx = 110;
  const by = (630 - badge) / 2;
  const glyphT = `translate(${bx + badge / 2},${by + badge / 2}) scale(${badge / 24 * 0.42}) translate(-12,-12)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0c2a17"/>
        <stop offset="0.55" stop-color="#121212"/>
        <stop offset="1" stop-color="#121212"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect x="${bx}" y="${by}" width="${badge}" height="${badge}" rx="40" fill="${GREEN}"/>
    <g transform="${glyphT}" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${headphones}</g>
    <text x="${bx + badge + 56}" y="300" font-family="DM Sans, Arial, Helvetica, sans-serif" font-size="92" font-weight="700" fill="#ffffff">Ibiga Beatz</text>
    <text x="${bx + badge + 60}" y="360" font-family="DM Sans, Arial, Helvetica, sans-serif" font-size="34" font-weight="500" fill="#1DB954">Afrobeats · Amapiano · R&amp;B Producer</text>
    <text x="${bx + badge + 60}" y="408" font-family="DM Sans, Arial, Helvetica, sans-serif" font-size="28" font-weight="400" fill="#A7A7A7">Beats · Custom productions · Studio sessions</text>
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
await png(og()).toFile("public/og.png");

console.log("Icons + og.png generated in public/ and app/icon.png");
