/*
 * A labelled contact sheet of renders, for reviewing a batch in one look.
 *
 *   node tools/contact-sheet.mjs [id-prefix …] [--out file.jpg]
 *   node tools/contact-sheet.mjs kelp gecko           only ids starting with these
 *
 * Writes higgsfield/contact-sheet.jpg by default (next to the renders, not published).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'higgsfield/renders');
const argv = process.argv.slice(2);
const oi = argv.indexOf('--out');
const out = oi > -1 ? path.resolve(argv[oi + 1]) : path.join(ROOT, 'higgsfield/contact-sheet.jpg');
const prefixes = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--out');

const files = fs.readdirSync(SRC)
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !/_v\d+\./.test(f))
  .filter((f) => !prefixes.length || prefixes.some((p) => f.startsWith(p)))
  .sort();
if (!files.length) { console.log('no renders match'); process.exit(0); }

const W = 520, H = 390, COLS = Math.min(4, files.length), LABEL = 34;
const tiles = [];
for (const [i, f] of files.entries()) {
  const img = await sharp(path.join(SRC, f)).resize(W, H, { fit: 'contain', background: '#111' }).toBuffer();
  const label = Buffer.from(`<svg width="${W}" height="${LABEL}"><rect width="100%" height="100%" fill="#0e1110"/><text x="10" y="23" font-family="Arial, sans-serif" font-size="18" fill="#c9f03c">${f}</text></svg>`);
  const x = (i % COLS) * W, y = Math.floor(i / COLS) * (H + LABEL);
  tiles.push({ input: label, left: x, top: y }, { input: img, left: x, top: y + LABEL });
}
const rows = Math.ceil(files.length / COLS);
await sharp({ create: { width: COLS * W, height: rows * (H + LABEL), channels: 3, background: '#0e1110' } })
  .composite(tiles).jpeg({ quality: 82 }).toFile(out);
console.log(`  ✓ ${path.relative(ROOT, out)}  (${files.length} renders)`);
