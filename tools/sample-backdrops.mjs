/*
 * Read the real backdrop colour of each studio render, for the colour pass after generation:
 * the site's slot colours should match what the model actually returned, not the hex we asked for.
 *
 *   node tools/sample-backdrops.mjs
 *
 * Samples three patches per image (top centre, left edge, right edge), where a letterbox meets the photo.
 * Note: sharp's stats() ignores extract(), so each patch is cropped to a buffer first.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'higgsfield/renders');
const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
const files = fs.readdirSync(SRC).filter((f) => /-(side|pair|sole)\.png$/.test(f)).sort();

for (const f of files) {
  const file = path.join(SRC, f);
  const { width: w, height: h } = await sharp(file).metadata();
  const patches = [[0.46, 0.04], [0.01, 0.45], [0.91, 0.45]];
  const out = [];
  for (const [x, y] of patches) {
    const buf = await sharp(file).extract({ left: Math.round(w * x), top: Math.round(h * y), width: Math.round(w * 0.08), height: Math.round(h * 0.08) }).toBuffer();
    const s = await sharp(buf).stats();
    out.push(hex(s.channels[0].mean, s.channels[1].mean, s.channels[2].mean));
  }
  console.log('  ' + f.replace('.png', '').padEnd(13) + out.join('  '));
}
