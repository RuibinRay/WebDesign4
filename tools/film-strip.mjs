/*
 * A strip of seven frames across a cut film, for reviewing its motion in one look.
 *
 *   node tools/film-strip.mjs hero          (reads assets/film/hero/d/)
 *   node tools/film-strip.mjs hero-m
 *
 * Writes higgsfield/strip-<name>.jpg (not published).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = process.argv[2];
const dir = path.join(ROOT, 'assets/film', name || '', 'd');
if (!name || !fs.existsSync(dir)) { console.log('usage: node tools/film-strip.mjs <film name>'); process.exit(1); }
const frames = fs.readdirSync(dir).filter((f) => f.endsWith('.webp')).sort();
const pick = Array.from({ length: 7 }, (_, i) => frames[Math.round((i / 6) * (frames.length - 1))]);
const meta = await sharp(fs.readFileSync(path.join(dir, pick[0]))).metadata();
const H = 360, W = Math.round((meta.width / meta.height) * H);
const tiles = [];
for (const [i, f] of pick.entries()) tiles.push({ input: await sharp(fs.readFileSync(path.join(dir, f))).resize(W, H).toBuffer(), left: i * W, top: 0 });
const out = path.join(ROOT, 'higgsfield', `strip-${name}.jpg`);
await sharp({ create: { width: 7 * W, height: H, channels: 3, background: '#000' } }).composite(tiles).jpeg({ quality: 80 }).toFile(out);
console.log(`  ✓ ${path.relative(ROOT, out)}  (${pick.join(', ')})`);
