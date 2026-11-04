#!/usr/bin/env node
// Draws public/logo.png (1024 px) and every favicon from public/logo.svg, and
// writes public/site.webmanifest from src/site.config.ts.
//
//   pnpm favicons
//
// Run it after changing the logo, the product name, or the colors.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (file) => path.join(root, 'public', file);
const { siteConfig } = await import(pathToFileURL(path.join(root, 'src/site.config.ts')).href);

const svg = await readFile(pub('logo.svg'));
/** Renders the SVG at its native resolution for `size`, so edges stay sharp. */
async function render(size) {
  const { width = 32 } = await sharp(svg).metadata();
  return sharp(svg, { density: (72 * size) / width })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const outputs = {
  'logo.png': 1024,
  'android-chrome-512x512.png': 512,
  'android-chrome-192x192.png': 192,
  'apple-touch-icon.png': 180,
  'favicon-32x32.png': 32,
  'favicon.png': 32,
  'favicon-16x16.png': 16
};
for (const [file, size] of Object.entries(outputs)) {
  await writeFile(pub(file), await render(size));
  console.log(`public/${file} (${size}×${size})`);
}

// favicon.ico with 16, 32, and 48 px PNG images inside.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(render));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + 16 * i;
  header.writeUInt8(size, entry); // width
  header.writeUInt8(size, entry + 1); // height
  header.writeUInt8(0, entry + 2); // palette
  header.writeUInt8(0, entry + 3); // reserved
  header.writeUInt16LE(1, entry + 4); // color planes
  header.writeUInt16LE(32, entry + 6); // bits per pixel
  header.writeUInt32LE(images[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
});
await writeFile(pub('favicon.ico'), Buffer.concat([header, ...images]));
console.log('public/favicon.ico (16, 32, 48)');

const manifest = {
  name: siteConfig.product,
  short_name: siteConfig.product,
  description: siteConfig.description,
  icons: [
    { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
  ],
  theme_color: siteConfig.colors.black,
  background_color: siteConfig.colors.black,
  display: 'standalone'
};
await writeFile(pub('site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
console.log('public/site.webmanifest');
