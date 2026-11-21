/**
 * HOLDFAST: turn renders into what the site loads.
 *
 *   node higgsfield/optimize.mjs
 *
 * Reads higgsfield/renders/ (from generate.mjs, or saved there by hand from the Higgsfield app) and writes:
 *   images   assets/img/<id>.webp (2000 px) and <id>-sm.webp (900 px); assets/img/og.jpg from the hero
 *   films    film-<name>.mp4 → assets/film/<name>/d/0001.webp…  (1600 px wide, 12 frames a second)
 *                              → assets/film/<name>/m/0001.webp…  (720 × 1280 portrait crop for phones)
 *            The first and last frames are swapped for the sharp start and end stills, where the page rests.
 *   3D       3d-<model>.glb → assets/3d/<model>.glb
 *   videos   any assets/video/<id>.mp4 you add by hand
 *   ready    assets/img/ready.js, the list of everything that exists; the site only asks for these
 *
 * Re-running is cheap: work is only redone when a render is newer than its output.
 * Films need ffmpeg (set FFMPEG_BIN if it is not on PATH).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

/* On Windows libvips keeps recently read files open, so overwriting a frame it just read fails. */
sharp.cache(false);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'higgsfield/renders');
const OUT = path.join(ROOT, 'assets/img');
const VID = path.join(ROOT, 'assets/video');
const FILM = path.join(ROOT, 'assets/film');
const M3D = path.join(ROOT, 'assets/3d');
const FPS = 12;

const ctx = {};
ctx.globalThis = ctx;
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/shots.js'), 'utf8'), ctx);
const S = ctx.HOLDFAST_SHOTS;
const known = new Set(S.shots.map((s) => s.id));
const newer = (a, b) => !fs.existsSync(b) || fs.statSync(a).mtimeMs > fs.statSync(b).mtimeMs;
const renders = fs.existsSync(SRC) ? fs.readdirSync(SRC).filter((f) => !/_v\d+\./.test(f)) : [];
const renderOf = (id) => renders.find((f) => f.replace(/\.[^.]+$/, '') === id && /\.(png|jpe?g|webp)$/i.test(f));
[OUT, FILM, M3D].forEach((d) => fs.mkdirSync(d, { recursive: true }));

/* ── images ── */
for (const file of renders.filter((f) => /\.(png|jpe?g|webp)$/i.test(f))) {
  const id = file.replace(/\.[^.]+$/, '');
  if (!known.has(id)) { console.log(`  · ${file}: not a shot id in js/shots.js, skipped`); continue; }
  const src = path.join(SRC, file), big = path.join(OUT, `${id}.webp`);
  if (!newer(src, big)) continue;
  const meta = await sharp(src).metadata();
  await sharp(src).resize({ width: Math.min(2000, meta.width) }).webp({ quality: 80, effort: 5 }).toFile(big);
  await sharp(src).resize({ width: Math.min(900, meta.width) }).webp({ quality: 78, effort: 5 }).toFile(path.join(OUT, `${id}-sm.webp`));
  console.log(`  ✓ ${id.padEnd(15)} ${meta.width}×${meta.height}`);
}

/* social card: the hero with the mark */
const hero = renderOf('hero');
if (hero && newer(path.join(SRC, hero), path.join(OUT, 'og.jpg'))) {
  const mark =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="120" height="120"><g fill="none" stroke="#C9F03C" stroke-width="3.2" stroke-linecap="round">' +
    '<path d="M20 3V17"/><path d="M20 17C20 23 11 25 7 33"/><path d="M20 17C18.5 24 16 28 14.5 33.5"/><path d="M20 17V34"/>' +
    '<path d="M20 17C21.5 24 24 28 25.5 33.5"/><path d="M20 17C20 23 29 25 33 33"/><path d="M3 37H37"/></g></svg>';
  await sharp(path.join(SRC, hero)).resize(1200, 630, { fit: 'cover', position: 'right' })
    .composite([{ input: Buffer.from(mark), left: 64, top: 64 }]).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(OUT, 'og.jpg'));
  console.log('  ✓ og.jpg');
}

/* ── 3D models ──
   Tripo returns ~45 MB (1.4 M triangles, three 2K textures). glTF-Transform simplifies the mesh,
   quantizes it (KHR_mesh_quantization, which three.js reads natively) and turns the textures into
   1K WebP: about 1.5 MB, with no decoder needed in the page. */
const GT = path.join(ROOT, 'node_modules/@gltf-transform/cli/bin/cli.js');
for (const m of S.models3d) {
  const src = path.join(SRC, `${m.id}.glb`), dst = path.join(M3D, `${m.model_of}.glb`);
  if (!fs.existsSync(src) || !newer(src, dst)) continue;
  const r = spawnSync(process.execPath, [GT, 'optimize', src, dst, '--compress', 'quantize', '--texture-compress', 'webp', '--texture-size', '1024', '--simplify-error', '0.0004']);
  if (r.status !== 0 || !fs.existsSync(dst)) { console.log(`  ✗ 3D ${m.model_of}: ${String(r.stderr || r.stdout).slice(0, 200)}`); continue; }
  console.log(`  ✓ 3D ${m.model_of}.glb  ${(fs.statSync(src).size / 1e6).toFixed(1)} MB → ${(fs.statSync(dst).size / 1e6).toFixed(1)} MB`);
}

/* ── films → scroll frames ── */
function ffmpegBin() {
  if (process.env.FFMPEG_BIN) return process.env.FFMPEG_BIN;
  if (spawnSync('ffmpeg', ['-version']).status === 0) return 'ffmpeg';
  const base = path.join(process.env.LOCALAPPDATA || '', 'Microsoft/WinGet/Packages');
  if (fs.existsSync(base)) {
    for (const d of fs.readdirSync(base).filter((n) => /ffmpeg/i.test(n))) {
      for (const sub of fs.readdirSync(path.join(base, d))) {
        const exe = path.join(base, d, sub, 'bin', 'ffmpeg.exe');
        if (fs.existsSync(exe)) return exe;
      }
    }
  }
  return null;
}
async function swapEnd(dir, still, index, w, h, focus, grade, neighbour) {
  if (!still) return;
  const meta = await sharp(still).metadata();
  const crop = h > w && meta.width > meta.height
    ? { left: Math.round((meta.width - (meta.height * w) / h) * focus), top: 0, width: Math.round((meta.height * w) / h), height: meta.height }
    : null;
  let img = sharp(still);
  if (crop) img = img.extract(crop);
  img = img.resize(w, h, { fit: 'cover' }).sharpen({ sigma: 0.6 }).removeAlpha();
  if (grade) {
    /* the same lift as ffmpeg's eq=gamma=<grade> on the film frames, so the resting frames match */
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const lut = new Uint8Array(256).map((_, v) => Math.round(255 * Math.pow(v / 255, 1 / grade)));
    for (let i = 0; i < data.length; i++) data[i] = lut[data[i]];
    img = sharp(data, { raw: info });
  }
  /* match the neighbouring film frame's brightness, so the frame the page rests on does not jump */
  if (neighbour && fs.existsSync(neighbour)) {
    const buf = await img.png().toBuffer();
    const a = (await sharp(buf).greyscale().stats()).channels[0].mean;
    const b = (await sharp(fs.readFileSync(neighbour)).greyscale().stats()).channels[0].mean;
    img = sharp(buf).linear(a > 1 ? b / a : 1, 0);
  }
  await img.webp({ quality: 84 }).toFile(path.join(dir, String(index).padStart(4, '0') + '.webp'));
}
const films = {};
const ff = S.films.some((f) => fs.existsSync(path.join(SRC, `${f.id}.mp4`))) ? ffmpegBin() : null;
for (const f of S.films) {
  const src = path.join(SRC, `${f.id}.mp4`), base = path.join(FILM, f.name);
  /* written only after both frame sets succeed, so an interrupted cut is redone next time */
  const stamp = path.join(base, 'done.json');
  /* f.grade (in js/shots.js) lifts a dark film: ffmpeg eq gamma. Changing it re-cuts the film. */
  const grade = f.grade || 0;
  const stampGrade = fs.existsSync(stamp) ? JSON.parse(fs.readFileSync(stamp, 'utf8')).grade || 0 : null;
  if (fs.existsSync(src) && (newer(src, stamp) || stampGrade !== grade)) {
    if (!ff) { console.log(`  ✗ ${f.id}: ffmpeg not found, set FFMPEG_BIN`); continue; }
    fs.rmSync(stamp, { force: true });
    const focus = f.focus ?? 0.5;
    const pre = `fps=${FPS},` + (grade ? `eq=gamma=${grade},` : '');
    let ok = 0;
    /* A landscape film gets a desktop set and a portrait crop for phones; the crop is skipped when the film
       has a vertical counterpart (phoneOf), which phones play instead. A vertical film gets one 720 × 1280 set. */
    const hasPhoneFilm = S.films.some((x) => x.phoneOf === f.name && fs.existsSync(path.join(SRC, `${x.id}.mp4`)));
    const sets = f.aspect === '9:16'
      ? [['d', `${pre}scale=720:1280:flags=lanczos,unsharp=5:5:0.35`]]
      : [
        ['d', `${pre}scale=1600:-2:flags=lanczos,unsharp=5:5:0.35`],
        ...(hasPhoneFilm ? [] : [['m', `${pre}crop=ih*9/16:ih:(iw-ih*9/16)*${focus}:0,scale=720:1280:flags=lanczos,unsharp=5:5:0.35`]]),
      ];
    if (hasPhoneFilm) fs.rmSync(path.join(base, 'm'), { recursive: true, force: true });
    for (const [set, vf] of sets) {
      const dir = path.join(base, set);
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      const r = spawnSync(ff, ['-v', 'error', '-y', '-i', src, '-an', '-vf', vf, '-c:v', 'libwebp', '-quality', '80', '-compression_level', '4', path.join(dir, '%04d.webp')]);
      if (r.status !== 0) { console.log(`  ✗ ${f.id} (${set}): ${String(r.stderr).slice(0, 200)}`); continue; }
      const frames = fs.readdirSync(dir).filter((n) => n.endsWith('.webp')).sort();
      const m0 = await sharp(fs.readFileSync(path.join(dir, frames[0]))).metadata();
      const st = (id) => (renderOf(id) ? path.join(SRC, renderOf(id)) : null);
      const fr = (n) => path.join(dir, String(n).padStart(4, '0') + '.webp');
      await swapEnd(dir, st(f.start), 1, m0.width, m0.height, focus, grade, fr(2));
      await swapEnd(dir, st(f.end), frames.length, m0.width, m0.height, focus, grade, fr(frames.length - 1));
      console.log(`  ✓ film ${f.name}/${set}  ${frames.length} frames ${m0.width}×${m0.height}`);
      ok++;
    }
    if (ok === sets.length) fs.writeFileSync(stamp, JSON.stringify({ from: path.basename(src), grade, at: new Date().toISOString() }));
  }
}
for (const f of S.films) {
  const count = (set) => { const d = path.join(FILM, f.name, set); return fs.existsSync(d) ? fs.readdirSync(d).filter((n) => n.endsWith('.webp')).length : 0; };
  if (count('d')) films[f.name] = { d: count('d'), m: count('m') };
}

/* ── the ready list ── */
const img = [...known].filter((id) => fs.existsSync(path.join(OUT, `${id}.webp`))).sort();
const video = fs.existsSync(VID) ? fs.readdirSync(VID).filter((f) => f.endsWith('.mp4')).map((f) => f.slice(0, -4)).sort() : [];
const model3d = S.models3d.map((m) => m.model_of).filter((m) => fs.existsSync(path.join(M3D, `${m}.glb`)));
fs.writeFileSync(
  path.join(OUT, 'ready.js'),
  '/* Written by higgsfield/optimize.mjs. Lists what exists, so the site never requests a missing file. */\n' +
    `window.HOLDFAST_READY = ${JSON.stringify({ img, video, film: films, model3d })};\n`
);
console.log(`\n  Ready: ${img.length} of ${known.size} images · films: ${Object.keys(films).join(', ') || 'none'} · 3D: ${model3d.join(', ') || 'none'}. Reload the site.\n`);
