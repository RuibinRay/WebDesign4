/*
 * Bundle the 3D shoe (js/src/shoe3d.src.js + the parts of three.js it uses)
 * into one minified classic script, js/shoe3d.js. The output is committed, so the
 * site itself still needs no build step. Run after editing the source:
 *
 *   node tools/build-3d.mjs
 */
import { build } from 'esbuild';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(ROOT, 'js/shoe3d.js');
await build({
  entryPoints: [path.join(ROOT, 'js/src/shoe3d.src.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  outfile: out,
  legalComments: 'eof',
  banner: { js: '/* Holdfast 3D shoe, bundled from js/src/shoe3d.src.js by tools/build-3d.mjs. Includes three.js (MIT). */' },
});
console.log(`  ✓ js/shoe3d.js  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
