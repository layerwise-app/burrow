#!/usr/bin/env node
// Adds images to the site: writes 800, 1600, and 2880 px WebP versions to
// public/images/, and records their size and a tiny blurred placeholder in
// src/content/images.json so pages can show them without layout shift.
//
//   pnpm add-images path/to/screenshot.png [more files…]
//   pnpm add-images path/to/screenshot.png --name hero-terminal
//
// GIFs are copied untouched (so they keep animating). SVGs are rejected:
// they are not raster images and can carry scripts.

import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public/images');
const manifestPath = path.join(root, 'src/content/images.json');
const WIDTHS = [800, 1600, 2880];

const args = process.argv.slice(2);
const nameFlag = args.indexOf('--name');
const forcedName = nameFlag >= 0 ? args[nameFlag + 1] : undefined;
const files = args.filter((arg, i) => !arg.startsWith('--') && (nameFlag < 0 || i !== nameFlag + 1));

if (files.length === 0) {
  console.error('usage: pnpm add-images <image> [more images…] [--name <name>]');
  process.exit(1);
}
if (forcedName && files.length > 1) {
  console.error('--name works with one image at a time.');
  process.exit(1);
}

const slug = (file) =>
  path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'image';

async function placeholder(input) {
  const buffer = await sharp(input, { animated: false })
    .resize(24, null, { fit: 'inside' })
    .blur(1.5)
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${buffer.toString('base64')}`;
}

let manifest = {};
try {
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch {
  manifest = {};
}

let failed = false;
let added = 0;
for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  const name = forcedName ?? slug(file);
  if (ext === '.svg') {
    console.error(`✗ ${file}: SVG is not supported. Export a PNG, JPEG, or WebP instead.`);
    failed = true;
    continue;
  }
  let meta;
  try {
    meta = await sharp(file, { animated: false }).metadata();
  } catch (error) {
    console.error(`✗ ${file}: not a readable image (${error.message})`);
    failed = true;
    continue;
  }
  if (meta.format === 'svg') {
    console.error(`✗ ${file}: SVG is not supported.`);
    failed = true;
    continue;
  }
  await mkdir(outDir, { recursive: true });
  const width = meta.autoOrient?.width ?? meta.width;
  const height = meta.autoOrient?.height ?? meta.height;

  if (meta.format === 'gif') {
    const target = `${name}.gif`;
    await copyFile(file, path.join(outDir, target));
    manifest[name] = {
      width,
      height: meta.pageHeight ?? height,
      placeholder: await placeholder(file),
      sources: [{ width, src: `/images/${target}` }],
      type: 'gif'
    };
    added++;
    console.log(`✓ ${name}: copied ${target} untouched (${width}×${meta.pageHeight ?? height})`);
    continue;
  }

  const sources = [];
  for (const target of WIDTHS) {
    const w = Math.min(target, width);
    if (sources.some((s) => s.width === w)) continue;
    const out = `${name}-${w}.webp`;
    await sharp(file)
      .rotate()
      .resize(w, null, { withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(outDir, out));
    sources.push({ width: w, src: `/images/${out}` });
  }
  manifest[name] = {
    width,
    height,
    placeholder: await placeholder(file),
    sources,
    type: 'webp'
  };
  added++;
  console.log(
    `✓ ${name}: ${sources.map((s) => `${s.width}w`).join(', ')} (${width}×${height}) → public/images/`
  );
}

if (added > 0) {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(manifestPath, JSON.stringify(sorted, null, 2) + '\n');
  console.log('Updated src/content/images.json');
}
if (failed) process.exit(1);
