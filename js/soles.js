/*
 * HOLDFAST: drawn graphics. The four outsole treads, the logo mark and the
 * side-view shoe silhouette.
 *
 * Each tread is defined once, as primitives (curves, lines, circles) in a
 * 200 × 500 box with the toe at the top. The same primitives draw the SVG
 * treads on the page and build the 3D lugs in js/shoe3d.js, so the 2D and 3D
 * soles always match.
 *
 *   HF_ART.sole('kelp', { stroke: '#C9F03C' })   → <svg> string
 *   HF_ART.tread('kelp')                         → { width, depth, items: [...] }
 *   HF_ART.outline(n)                            → [[x, y], …] n points around the sole
 *   HF_ART.mark() / HF_ART.shoe()                → logo mark / side silhouette
 *
 * Every tread path carries pathLength="1" and class "t", so CSS can draw it in
 * with stroke-dashoffset (see .sole--draw in holdfast.css).
 */
(function (root) {
  /* Outsole outline, viewBox 0 0 200 500, toe at the top. */
  var OUTLINE =
    'M100 492C64 492 42 470 40 432C38 396 46 360 52 326C57 296 50 262 38 228C26 192 20 150 24 110' +
    'C28 56 58 10 100 8C144 6 174 44 178 96C182 146 172 192 160 226C150 256 146 290 150 324' +
    'C155 362 162 398 160 434C158 472 136 492 100 492Z';

  /* The same outline as cubic segments, so it can be sampled without a DOM. */
  var CUBICS = (function () {
    var nums = OUTLINE.match(/-?\d+(\.\d+)?/g).map(Number);
    var out = [], x = nums[0], y = nums[1];
    for (var i = 2; i + 5 < nums.length; i += 6) {
      out.push([x, y, nums[i], nums[i + 1], nums[i + 2], nums[i + 3], nums[i + 4], nums[i + 5]]);
      x = nums[i + 4]; y = nums[i + 5];
    }
    return out;
  })();
  function cubicAt(c, t) {
    var u = 1 - t;
    return [
      u * u * u * c[0] + 3 * u * u * t * c[2] + 3 * u * t * t * c[4] + t * t * t * c[6],
      u * u * u * c[1] + 3 * u * u * t * c[3] + 3 * u * t * t * c[5] + t * t * t * c[7],
    ];
  }
  function outline(n) {
    var per = Math.max(2, Math.round(n / CUBICS.length)), pts = [];
    CUBICS.forEach(function (c) { for (var i = 0; i < per; i++) pts.push(cubicAt(c, i / per)); });
    return pts;
  }

  /* Small seeded random so a tread looks hand-made but is identical on every load. */
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  var f = function (n) { return Math.round(n * 10) / 10; };

  /* ───── tread primitives ─────
     { q: [x0,y0, cx,cy, x1,y1] }   quadratic curve
     { l: [x0,y0, x1,y1, …] }       polyline
     { c: [cx, cy, r], fill }       circle (ring, or a filled dot) */

  function kelp() {
    var r = rng(7), items = [];
    for (var row = 0; row < 11; row++) {
      for (var col = 0; col < 5; col++) {
        var cx = 14 + col * 44 + (row % 2 ? 22 : 0) + (r() - 0.5) * 10;
        var cy = 26 + row * 44 + (r() - 0.5) * 10;
        var n = 4 + Math.floor(r() * 3);
        var a0 = r() * Math.PI * 2;
        for (var i = 0; i < n; i++) {
          var a = a0 + (i / n) * Math.PI * 2 + (r() - 0.5) * 0.5;
          var len = 13 + r() * 9;
          var curl = (r() > 0.5 ? 1 : -1) * (0.5 + r() * 0.5);
          items.push({ q: [cx, cy, cx + Math.cos(a) * len * 0.55, cy + Math.sin(a) * len * 0.55, cx + Math.cos(a + curl * 0.6) * len, cy + Math.sin(a + curl * 0.6) * len] });
        }
        items.push({ c: [cx, cy, 3.2], fill: true });
      }
    }
    return { width: 5.2, depth: 5, items: items };
  }

  function gecko() {
    var items = [];
    for (var y = 6; y < 500; y += 6) {
      var pts = [-4, y];
      for (var x = 0; x <= 204; x += 10) {
        var v = Math.abs(x - 100) / 100;
        pts.push(x, y + Math.sin(x / 9 + y / 40) * 1.6 + (1 - v) * 9);
      }
      items.push({ l: pts });
    }
    return { width: 1.7, depth: 2.2, items: items };
  }

  function octo() {
    var items = [], r = rng(3);
    for (var row = 0; row < 24; row++) {
      for (var col = 0; col < 9; col++) {
        var cx = col * 25 + (row % 2 ? 12.5 : 0);
        var cy = 10 + row * 21.5;
        var big = (cy < 230 || cy > 380) ? r() > 0.25 : r() > 0.7;
        items.push({ c: [cx, cy, big ? 9.5 : 6] });
        items.push({ c: [cx, cy, big ? 3.4 : 2], fill: true });
      }
    }
    return { width: 2.4, depth: 3, items: items };
  }

  function limpet() {
    var items = [], r = rng(11);
    for (var i = 0; i < 220; i++) items.push({ c: [20 + r() * 160, 14 + r() * 160, 0.9], fill: true, fine: true });
    var edge = [], c = [18, 186, 60, 168, 140, 168, 182, 186];
    for (var t = 0; t <= 1.0001; t += 0.1) {
      var u = 1 - t;
      edge.push(u * u * u * c[0] + 3 * u * u * t * c[2] + 3 * u * t * t * c[4] + t * t * t * c[6], u * u * u * c[1] + 3 * u * u * t * c[3] + 3 * u * t * t * c[5] + t * t * t * c[7]);
    }
    items.push({ l: edge });
    for (var y2 = 206; y2 < 340; y2 += 13) items.push({ l: [30, y2 + 10, 100, y2, 170, y2 + 10] });
    for (var rad = 8; rad <= 92; rad += 9) items.push({ c: [100, 420, rad] });
    return { width: 3.1, depth: 4, items: items };
  }

  var PATTERNS = { kelp: kelp, gecko: gecko, octo: octo, limpet: limpet };
  var cache = {};
  function tread(model) { return cache[model] || (cache[model] = PATTERNS[model]()); }

  function svgItem(it) {
    if (it.q) { var q = it.q.map(f); return '<path class="t" pathLength="1" d="M' + q[0] + ' ' + q[1] + 'Q' + q[2] + ' ' + q[3] + ' ' + q[4] + ' ' + q[5] + '"/>'; }
    if (it.l) {
      var d = '';
      for (var i = 0; i < it.l.length; i += 2) d += (i ? 'L' : 'M') + f(it.l[i]) + ' ' + f(it.l[i + 1]);
      return '<path class="t" pathLength="1" d="' + d + '"/>';
    }
    return '<circle class="t' + (it.fill ? ' f' : '') + '" pathLength="1" cx="' + f(it.c[0]) + '" cy="' + f(it.c[1]) + '" r="' + it.c[2] + '"/>';
  }

  var uid = 0;
  function sole(model, o) {
    o = o || {};
    var p = tread(model);
    if (!p.svg) p.svg = p.items.map(svgItem).join('');
    var id = 'hfc' + ++uid;
    var stroke = o.stroke || 'currentColor';
    return (
      '<svg class="sole sole--' + model + (o.className ? ' ' + o.className : '') + '" viewBox="0 0 200 500" role="img" aria-label="' +
      (o.label || 'The ' + model + ' outsole tread pattern') + '">' +
      '<defs><clipPath id="' + id + '"><path d="' + OUTLINE + '"/></clipPath></defs>' +
      (o.fill ? '<path d="' + OUTLINE + '" fill="' + o.fill + '"/>' : '') +
      '<g clip-path="url(#' + id + ')" fill="none" stroke="' + stroke + '" stroke-width="' + p.width + '" stroke-linecap="round" stroke-linejoin="round">' +
      p.svg +
      '</g>' +
      '<path class="sole__edge" d="' + OUTLINE + '" fill="none" stroke="' + stroke + '" stroke-width="2.4"/>' +
      '</svg>'
    );
  }

  /* The mark: a holdfast gripping a ledge. */
  function mark(o) {
    o = o || {};
    return (
      '<svg class="mark' + (o.className ? ' ' + o.className : '') + '" viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round">' +
      '<path d="M20 3V17"/><path d="M20 17C20 23 11 25 7 33"/><path d="M20 17C18.5 24 16 28 14.5 33.5"/><path d="M20 17V34"/>' +
      '<path d="M20 17C21.5 24 24 28 25.5 33.5"/><path d="M20 17C20 23 29 25 33 33"/><path d="M3 37H37"/></svg>'
    );
  }

  /* Side-view shoe, toe right, viewBox 0 0 240 100. */
  function shoe(o) {
    o = o || {};
    return (
      '<svg class="shoe' + (o.className ? ' ' + o.className : '') + '" viewBox="0 0 240 100" aria-hidden="true">' +
      '<path fill="' + (o.upper || 'currentColor') + '" d="M10 90L226 90C236 90 238 79 230 71C214 58 190 52 160 46L113 29C104 21 95 19 89 23L72 37C60 44 47 40 40 29C31 17 15 19 10 34C6 52 6 74 10 90Z"/>' +
      '<path fill="' + (o.sole || '#000') + '" d="M8 80H232C236 84 236 92 228 96H14C8 96 6 88 8 80Z"/>' +
      '</svg>'
    );
  }

  root.HF_ART = { sole: sole, tread: tread, outline: outline, mark: mark, shoe: shoe, OUTLINE: OUTLINE };
})(window);
