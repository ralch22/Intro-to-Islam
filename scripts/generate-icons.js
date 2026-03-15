#!/usr/bin/env node
/**
 * PWA Icon Generator — IntroToIslam
 * Sprint 5 / S5-1
 *
 * Generates all required PNG icons using sharp (via @img/sharp-darwin-arm64).
 * Icon design: dark rounded square (#1F2937) with magenta crescent + white "ITI" text
 * via SVG template, converted to PNG at each required size.
 *
 * Run: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// SVG template for the icon (any size — sharp scales it)
// Design: dark background, magenta circle accent, white "ITI" monogram
function makeIconSvg(size, maskable = false) {
  const pad = maskable ? Math.round(size * 0.1) : 0; // 10% safe zone each side for maskable
  const inner = size - pad * 2;
  const cx = size / 2;
  const cy = size / 2;
  const r = inner / 2;
  const textSize = Math.round(inner * 0.28);
  const crescentR = Math.round(inner * 0.32);
  const crescentOff = Math.round(inner * 0.08);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#1F2937" rx="${Math.round(size * 0.18)}"/>
  <!-- Magenta circle -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#E81C74" opacity="0.15"/>
  <!-- Crescent shape: large circle minus offset circle -->
  <defs>
    <mask id="crescent">
      <circle cx="${cx}" cy="${cy}" r="${crescentR}" fill="white"/>
      <circle cx="${cx + crescentOff}" cy="${cy - crescentOff}" r="${Math.round(crescentR * 0.82)}" fill="black"/>
    </mask>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${crescentR}" fill="#E81C74" mask="url(#crescent)"/>
  <!-- White star -->
  <text x="${cx + Math.round(crescentR * 0.45)}" y="${cy - Math.round(crescentR * 0.35)}"
        font-family="Arial, sans-serif" font-size="${Math.round(textSize * 0.5)}"
        fill="white" text-anchor="middle" dominant-baseline="central">★</text>
  <!-- ITI monogram -->
  <text x="${cx}" y="${cy + Math.round(r * 0.38)}"
        font-family="Arial Black, sans-serif" font-weight="900"
        font-size="${textSize}" fill="white"
        text-anchor="middle" dominant-baseline="central" letter-spacing="2">ITI</text>
</svg>`;
}

const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  for (const size of SIZES) {
    // Regular icon
    const svgBuf = Buffer.from(makeIconSvg(size, false));
    const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
    const outPath = path.join(OUTPUT_DIR, filename);
    await sharp(svgBuf).resize(size, size).png().toFile(outPath);
    console.log(`  ✓ ${filename} (${size}×${size})`);
  }

  // Maskable variants (with safe zone padding)
  for (const size of [192, 512]) {
    const svgBuf = Buffer.from(makeIconSvg(size, true));
    const outPath = path.join(OUTPUT_DIR, `maskable-icon-${size}.png`);
    await sharp(svgBuf).resize(size, size).png().toFile(outPath);
    console.log(`  ✓ maskable-icon-${size}.png (${size}×${size}, maskable safe zone)`);
  }

  console.log('\nAll icons generated successfully.');
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

generateIcons().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
