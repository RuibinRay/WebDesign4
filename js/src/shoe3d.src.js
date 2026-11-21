/*
 * HOLDFAST: the 3D shoe. Source file; the site loads the bundled js/shoe3d.js.
 * After editing, rebuild with:  node tools/build-3d.mjs
 *
 * The shoe is built from the same tread data as the 2D drawings (HF_ART.tread),
 * so every lug in 3D sits exactly where it sits on the page:
 *   outsole  rubber plate + lugs extruded from the tread primitives
 *   midsole  ribbed foam stack with toe spring
 *   insole   a thin footbed
 *   upper    a lofted knit shell with a wire overlay, collar rim, laces and heel loop
 *
 * If a Higgsfield image-to-3D model exists (assets/3d/<id>.glb) the viewer shows that instead.
 *
 *   const v = HF3D.create(canvas, { model: 'kelp', mat, mode: 'explode' | 'viewer', glb })
 *   v.setProgress(0..1)    scroll choreography (explode mode)
 *   v.setView('three' | 'side' | 'sole' | 'explode')
 *   v.dispose()
 */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, LineSegments, BufferGeometry, BufferAttribute, Float32BufferAttribute,
  Shape, Vector2, Vector3, ExtrudeGeometry, MeshStandardMaterial, MeshBasicMaterial, LineBasicMaterial, DirectionalLight, HemisphereLight,
  PMREMGenerator, ACESFilmicToneMapping, SRGBColorSpace, DoubleSide, PlaneGeometry, CanvasTexture, TubeGeometry, CatmullRomCurve3,
  TorusGeometry, Box3, MathUtils,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const ART = window.HF_ART;
const U = 0.01; // one SVG unit of the 200 × 500 sole box, in scene units
const toX = (x) => (x - 100) * U;
const toZ = (y) => (y - 250) * U;

/* toe spring and heel rocker: lift the ends of everything a little */
function bend(geo) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const z = p.getZ(i);
    const toe = Math.max(0, (-z - 1.0) / 1.42);
    const heel = Math.max(0, (z - 1.75) / 0.67);
    p.setY(i, p.getY(i) + 0.46 * toe * toe + 0.1 * heel * heel);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function inside(pt, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/* ───── the sole parts ───── */
function slab(poly, scale, y0, h) {
  let cx = 0, cy = 0;
  poly.forEach(([x, y]) => { cx += x; cy += y; });
  cx /= poly.length; cy /= poly.length;
  const shape = new Shape(poly.map(([x, y]) => new Vector2(toX(cx + (x - cx) * scale), -toZ(cy + (y - cy) * scale))));
  const g = new ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 1 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0, 0);
  return g;
}

/* tread primitives → polylines → one merged geometry of rubber bars */
function lugs(model, poly) {
  const t = ART.tread(model);
  const w = t.width * U * 1.05;
  const h = t.depth * 0.022;
  const lines = [];
  for (const it of t.items) {
    if (it.fine) continue;
    if (it.q) {
      const [x0, y0, cx, cy, x1, y1] = it.q, pts = [];
      for (let s = 0; s <= 6; s++) {
        const k = s / 6, u = 1 - k;
        pts.push([u * u * x0 + 2 * u * k * cx + k * k * x1, u * u * y0 + 2 * u * k * cy + k * k * y1]);
      }
      lines.push({ pts, w });
    } else if (it.l) {
      const pts = [];
      for (let i = 0; i < it.l.length; i += 2) pts.push([it.l[i], it.l[i + 1]]);
      lines.push({ pts, w });
    } else if (it.c) {
      const [cx, cy, r] = it.c, n = r > 5 ? 16 : 10, pts = [];
      const rr = it.fill ? r * 0.55 : r;
      for (let s = 0; s <= n; s++) pts.push([cx + Math.cos((s / n) * Math.PI * 2) * rr, cy + Math.sin((s / n) * Math.PI * 2) * rr]);
      lines.push({ pts, w: it.fill ? r * U * 1.1 : w });
    }
  }
  const pos = [];
  const quad = (a, b, c, d) => pos.push(...a, ...b, ...c, ...a, ...c, ...d);
  for (const ln of lines) {
    for (let i = 0; i < ln.pts.length - 1; i++) {
      const A = ln.pts[i], B = ln.pts[i + 1];
      if (!inside(A, poly) || !inside(B, poly)) continue;
      const ax = toX(A[0]), az = toZ(A[1]), bx = toX(B[0]), bz = toZ(B[1]);
      let dx = bx - ax, dz = bz - az;
      const len = Math.hypot(dx, dz) || 1e-6;
      dx /= len; dz /= len;
      const hw = ln.w / 2, nx = -dz * hw, nz = dx * hw;
      const sx = ax - dx * hw, sz = az - dz * hw, ex = bx + dx * hw, ez = bz + dz * hw;
      const t0 = [sx + nx, 0, sz + nz], t1 = [sx - nx, 0, sz - nz], t2 = [ex - nx, 0, ez - nz], t3 = [ex + nx, 0, ez + nz];
      const b0 = [t0[0], -h, t0[2]], b1 = [t1[0], -h, t1[2]], b2 = [t2[0], -h, t2[2]], b3 = [t3[0], -h, t3[2]];
      quad(b0, b1, b2, b3);
      quad(t0, b0, b3, t3); quad(t2, b2, b1, t1); quad(t1, b1, b0, t0); quad(t3, b3, b2, t2);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/* ridge height of the upper along the foot, t = 0 toe → 1 heel */
const HK = [[0, 0.1], [0.07, 0.28], [0.22, 0.56], [0.42, 0.88], [0.6, 1.1], [0.76, 0.96], [0.9, 1.08], [1, 0.94]];
function ridge(t) {
  for (let i = 0; i < HK.length - 1; i++) {
    const [t0, h0] = HK[i], [t1, h1] = HK[i + 1];
    if (t <= t1) { const k = (t - t0) / (t1 - t0); return h0 + (h1 - h0) * (0.5 - Math.cos(k * Math.PI) / 2); }
  }
  return HK[HK.length - 1][1];
}
const collarMax = (t) => (t > 0.6 && t < 0.985 ? 0.66 + 0.1 * Math.pow(Math.abs(t - 0.79) / 0.19, 2) : 1);

function upperParts(mat, y0) {
  const poly = ART.outline(72);
  const C = poly.length, R = 13;
  const P = (ci, v) => {
    const [x, y] = poly[ci];
    const X = toX(x) * 0.985, Z = toZ(y) * 0.99;
    const t = (Z + 2.42) / 4.84;
    const shrink = 0.9 * Math.pow(v, 1.5);
    return [X * (1 - shrink), y0 + ridge(t) * Math.pow(Math.sin((v * Math.PI) / 2), 0.85), Z * (1 - 0.1 * v * v), t];
  };
  const verts = [], vmax = [];
  for (let c = 0; c < C; c++) {
    vmax.push(collarMax(P(c, 0)[3]));
    for (let r = 0; r <= R; r++) verts.push(P(c, Math.min(r / R, vmax[c])));
  }
  const idx = (c, r) => (c % C) * (R + 1) + r;
  const tris = [], wire = [];
  for (let c = 0; c < C; c++) {
    const rows = Math.round(Math.min(vmax[c], vmax[(c + 1) % C]) * R);
    for (let r = 0; r < rows; r++) {
      tris.push(idx(c, r), idx(c + 1, r), idx(c + 1, r + 1), idx(c, r), idx(c + 1, r + 1), idx(c, r + 1));
      wire.push(idx(c, r), idx(c + 1, r));
      if (c % 2 === 0) wire.push(idx(c, r), idx(c, r + 1));
    }
  }
  const pos = new Float32Array(verts.length * 3);
  verts.forEach((v, i) => pos.set([v[0], v[1], v[2]], i * 3));

  const shell = new BufferGeometry();
  shell.setAttribute('position', new BufferAttribute(pos, 3));
  shell.setIndex(tris);
  bend(shell);
  const lines = new BufferGeometry();
  lines.setAttribute('position', shell.attributes.position);
  lines.setIndex(wire);

  const g = new Group();
  const shellMat = new MeshStandardMaterial({ color: mat.upper, roughness: 0.82, metalness: 0, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, transparent: true });
  g.add(new Mesh(shell, shellMat));
  g.add(new LineSegments(lines, new LineBasicMaterial({ color: mat.wire, transparent: true, opacity: 0.55 })));

  /* collar rim, laces, heel loop in the accent colour */
  const accent = new MeshStandardMaterial({ color: mat.accent, roughness: 0.5, transparent: true });
  const sp = shell.attributes.position;
  const at = (c, r) => new Vector3(sp.getX(idx(c, r)), sp.getY(idx(c, r)), sp.getZ(idx(c, r)));
  const rim = [];
  for (let c = 0; c < C; c++) if (vmax[c] < 1) rim.push(at(c, R));
  if (rim.length > 3) g.add(new Mesh(new TubeGeometry(new CatmullRomCurve3(rim), 60, 0.028, 6, false), accent));
  const nearest = (z, side) => {
    let best = -1, d = 1e9;
    for (let c = 0; c < C; c++) {
      const x = toX(poly[c][0]), zz = toZ(poly[c][1]);
      if (Math.sign(x) !== side) continue;
      if (Math.abs(zz - z) < d) { d = Math.abs(zz - z); best = c; }
    }
    return best;
  };
  for (let k = 0; k < 5; k++) {
    const z = -1.05 + k * 0.26;
    const a = at(nearest(z, -1), Math.round(R * 0.86)), b = at(nearest(z, 1), Math.round(R * 0.86));
    const m = a.clone().add(b).multiplyScalar(0.5); m.y += 0.07;
    g.add(new Mesh(new TubeGeometry(new CatmullRomCurve3([a, m, b]), 12, 0.024, 6, false), accent));
  }
  /* outline point 0 is the centre of the heel, where the heel tab rises */
  const heel = new Mesh(new TorusGeometry(0.11, 0.028, 8, 24), accent);
  const tab = at(0, R);
  heel.position.set(tab.x, tab.y + 0.06, tab.z + 0.05);
  heel.rotation.y = Math.PI / 2;
  g.add(heel);
  return g;
}

function contactShadow() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(64, 64, 4, 64, 64, 64);
  gr.addColorStop(0, 'rgba(0,0,0,.55)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = gr;
  x.fillRect(0, 0, 128, 128);
  const m = new Mesh(new PlaneGeometry(3.2, 6.4), new MeshBasicMaterial({ map: new CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  return m;
}

/* ───── scroll choreography for explode mode ───── */
const K = [
  { rx: 0.22, ry: -2.0, e: 0, focus: null },          // the whole shoe, three-quarter
  { rx: -1.3, ry: -1.62, e: 0.25, focus: 'outsole' }, // 1 lugs: sole turned to camera
  { rx: 0.06, ry: -1.57, e: 0, focus: 'outsole' },    // 2 toe wrap: pure side
  { rx: 0.34, ry: -0.95, e: 1, focus: 'mid' },        // 3 ribbed midsole: exploded
  { rx: 0.3, ry: -2.25, e: 0.65, focus: 'upper' },    // 4 sealed upper
  { rx: 0.2, ry: 0.55, e: 0, focus: 'upper' },        // 5 heel: rear three-quarter
];
const VIEWS = {
  three: { rx: 0.22, ry: -2.0, e: 0 },
  side: { rx: 0.04, ry: -1.57, e: 0 },
  sole: { rx: -1.3, ry: -1.62, e: 0.2 },
  explode: { rx: 0.34, ry: -0.95, e: 1 },
};
const smooth = (t) => t * t * (3 - 2 * t);

export function supported() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

export function create(canvas, opts) {
  const mat = opts.mat;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new HemisphereLight(0xffffff, 0x1a2020, 0.5));
  const key = new DirectionalLight(0xffffff, 2.2); key.position.set(3, 6, 4); scene.add(key);
  const rim = new DirectionalLight(0xd8f5a0, 1.2); rim.position.set(-5, 2, -4); scene.add(rim);
  const fill = new DirectionalLight(0xffffff, 0.9); fill.position.set(0, 1.2, 10); scene.add(fill); // from the camera, so a sole turned to face you is lit

  const camera = new PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 1.5, 11.5);
  camera.lookAt(0, 0.1, 0);

  const pivot = new Group();
  scene.add(pivot);
  const shoe = new Group();
  shoe.position.y = -0.6;
  pivot.add(shoe);
  const shadow = contactShadow();
  shadow.position.y = -1.05;
  scene.add(shadow);

  /* build the layers */
  const poly = ART.outline(160);
  const layers = { outsole: new Group(), mid: new Group(), insole: new Group(), upper: new Group() };
  const mats = [];
  const M = (o) => { const m = new MeshStandardMaterial(Object.assign({ roughness: 0.7, metalness: 0, transparent: true }, o)); mats.push(m); return m; };

  const rubber = M({ color: mat.sole, roughness: 0.62, opacity: mat.soleOpacity || 1 });
  layers.outsole.add(new Mesh(bend(slab(poly, 1, 0, 0.07)), rubber));
  layers.outsole.add(new Mesh(bend(lugs(opts.model, poly)), rubber));

  const ribs = [];
  for (let i = 0; i < 6; i++) ribs.push(slab(poly, i % 2 ? 0.972 : 1, 0.07 + i * 0.06, 0.06));
  layers.mid.add(new Mesh(bend(mergeGeometries(ribs)), M({ color: mat.mid, roughness: 0.86 })));
  layers.insole.add(new Mesh(bend(slab(poly, 0.93, 0.43, 0.035)), M({ color: '#d9dcd3', roughness: 0.95 })));
  layers.upper.add(upperParts(mat, 0.45));
  layers.upper.traverse((o) => { if (o.material && !mats.includes(o.material)) mats.push(o.material); });
  Object.values(layers).forEach((g) => shoe.add(g));
  const owner = new Map();
  Object.keys(layers).forEach((n) => layers[n].traverse((o) => { if (o.material) owner.set(o.material, n); }));
  mats.forEach((m) => { m.userData.base = m.opacity; });

  /* optional: a Higgsfield image-to-3D model replaces the drawn shoe in viewer mode */
  let glb = null;
  if (opts.glb && opts.mode === 'viewer') {
    new GLTFLoader().load(opts.glb, (g) => {
      glb = g.scene;
      const box = new Box3().setFromObject(glb), size = box.getSize(new Vector3()), mid = box.getCenter(new Vector3());
      const s = 4.84 / Math.max(size.x, size.z);
      glb.position.sub(mid.multiplyScalar(s));
      glb.scale.setScalar(s);
      glb.rotation.y = opts.glbRotateY || 0;
      /* scanned textures already carry their lighting; full studio reflections wash them out */
      glb.traverse((o) => { if (o.material) { o.material.envMapIntensity = 0.45; o.material.color.multiplyScalar(0.82); o.material.needsUpdate = true; } });
      renderer.toneMappingExposure = 0.85;
      if (opts.onGlb) opts.onGlb();
      Object.values(layers).forEach((l) => (l.visible = false));
      shoe.add(glb);
      dirty = true;
    }, undefined, () => {});
  }

  /* state */
  const cur = { rx: K[0].rx, ry: K[0].ry, e: 0 };
  const tgt = { ...cur };
  let focus = null, visible = true, dirty = true, raf = 0, last = performance.now();
  let drag = null, idleSpin = opts.mode === 'viewer', spinT = 0;
  const grab = { rx: 0, ry: 0 };

  function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.9 ? 40 : 28;
    camera.updateProjectionMatrix();
    dirty = true;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();

  function tick(now) {
    raf = 0;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (idleSpin && !drag) { spinT += dt; tgt.ry += dt * 0.25; }
    const k = 1 - Math.exp(-dt * 6);
    let moving = false;
    for (const p of ['rx', 'ry', 'e']) {
      const d = tgt[p] - cur[p];
      if (Math.abs(d) > 0.0005) { cur[p] += d * k; moving = true; } else cur[p] = tgt[p];
    }
    /* explode mode: a grab adds a turn on top of the scroll pose; let go and it eases back */
    if (!drag && (Math.abs(grab.rx) > 0.0005 || Math.abs(grab.ry) > 0.0005)) {
      const back = Math.exp(-dt * 2.6);
      grab.rx *= back; grab.ry *= back; moving = true;
    }
    pivot.rotation.set(cur.rx + grab.rx, cur.ry + grab.ry, 0, 'XYZ');
    const e = cur.e;
    layers.outsole.position.y = -0.95 * e;
    layers.mid.position.y = -0.22 * e;
    layers.insole.position.y = 0.38 * e;
    layers.upper.position.y = 1.0 * e;
    shadow.material.opacity = 1 - 0.6 * e;
    for (const m of mats) {
      const o = owner.get(m);
      const want = (focus && o && o !== focus ? 0.2 : 1) * m.userData.base;
      if (Math.abs(m.opacity - want) > 0.005) { m.opacity += (want - m.opacity) * k; moving = true; }
      m.depthWrite = m.opacity > 0.9;
    }
    renderer.render(scene, camera);
    dirty = false;
    if (visible && (moving || idleSpin || drag)) raf = requestAnimationFrame(tick);
  }
  const wake = () => { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(tick); } };

  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) wake(); });
  io.observe(canvas);

  /* drag to turn (viewer mode) */
  if (opts.mode === 'viewer') {
    canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; idleSpin = false; canvas.setPointerCapture(e.pointerId); wake(); });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return;
      tgt.ry += (e.clientX - drag.x) * 0.01;
      tgt.rx = MathUtils.clamp(tgt.rx + (e.clientY - drag.y) * 0.006, -1.45, 1.1);
      drag = { x: e.clientX, y: e.clientY };
      wake();
    });
    const end = () => { drag = null; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  } else {
    /* explode mode: grabbable too. Horizontal drags turn it (touch-action: pan-y keeps vertical swipes scrolling). */
    canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); canvas.classList.add('is-grabbing'); wake(); });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return;
      grab.ry += (e.clientX - drag.x) * 0.01;
      grab.rx = MathUtils.clamp(grab.rx + (e.clientY - drag.y) * 0.006, -1.2, 1.2);
      drag = { x: e.clientX, y: e.clientY };
      wake();
    });
    const end = () => { drag = null; canvas.classList.remove('is-grabbing'); wake(); };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  }

  return {
    setProgress(p) {
      const n = K.length - 1, x = MathUtils.clamp(p, 0, 1) * n;
      const i = Math.min(n - 1, Math.floor(x)), t = smooth(MathUtils.clamp((x - i - 0.2) / 0.6, 0, 1));
      const a = K[i], b = K[i + 1];
      tgt.rx = a.rx + (b.rx - a.rx) * t;
      tgt.ry = a.ry + (b.ry - a.ry) * t;
      tgt.e = a.e + (b.e - a.e) * t;
      focus = (t < 0.5 ? a : b).focus;
      wake();
      return t < 0.5 ? i : i + 1;
    },
    setView(name) {
      const v = VIEWS[name] || VIEWS.three;
      idleSpin = false;
      const turns = Math.round((cur.ry - v.ry) / (Math.PI * 2));
      tgt.ry = v.ry + turns * Math.PI * 2;
      tgt.rx = v.rx;
      tgt.e = glb ? 0 : v.e;
      focus = null;
      wake();
    },
    spin(on) { idleSpin = on; wake(); },
    render() { dirty = true; wake(); },
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); },
  };
}

window.HF3D = { create, supported };
