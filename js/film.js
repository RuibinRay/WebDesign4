/*
 * HOLDFAST: scroll films. Scrolling plays a film forward and back.
 *
 *   <section class="film" data-film="hero" style="--len:320">     (--len = section height in svh)
 *     <div class="film__stage">                                  (sticky, one screen tall)
 *       <figure class="slot slot--fill film__still" data-shot="hero">     start frame
 *       <figure class="slot slot--fill film__still film__still--end" data-shot="hero-end">  end frame
 *       <canvas class="film__canvas">
 *       <div class="chap" data-in="0" data-out=".26">…</div>     copy that shows between two moments
 *       <div class="film__hud">…</div>
 *
 * Three tiers, so the section is designed whatever exists:
 *   1. frames   assets/film/<name>/d|m/0001.webp…  (listed in ready.js by optimize.mjs) → drawn on the canvas
 *   2. stills   start and end frames exist → a slow push-in that crossfades from one to the other
 *   3. nothing  the two placeholders crossfade and the HUD reads out the storyboard beat by beat
 */
(function (root) {
  var SHOTS = root.HOLDFAST_SHOTS, READY = root.HOLDFAST_READY || {}, MEDIA = root.HF_MEDIA, UI = root.HF_UI;
  var FILMS = (READY.film || {});
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n.toFixed(1); };

  function Film(sec) {
    var name = sec.dataset.film;
    var meta = SHOTS.films.filter(function (f) { return f.name === name; })[0];
    var stage = sec.querySelector('.film__stage');
    var canvas = sec.querySelector('.film__canvas');
    var ctx = canvas.getContext('2d');
    var stillA = sec.querySelector('.film__still:not(.film__still--end)');
    var stillB = sec.querySelector('.film__still--end');
    var chaps = Array.prototype.slice.call(sec.querySelectorAll('.chap'));
    var bar = sec.querySelector('.film__bar i');
    var tc = sec.querySelector('.film__tc');
    var beat = sec.querySelector('.film__beat');
    var focus = parseFloat(sec.dataset.focus || '0.5');
    var dur = meta ? meta.params.duration : 10;
    var have = FILMS[name];
    var phone = root.matchMedia('(max-width: 700px) and (orientation: portrait)').matches;
    /* On a portrait phone, a film shot vertically for this section (phoneOf) beats a crop of the landscape one. */
    var vertical = SHOTS.films.filter(function (f) { return f.phoneOf === name && FILMS[f.name]; })[0];
    var dir, count;
    if (phone && vertical) { dir = vertical.name + '/d'; count = FILMS[vertical.name].d; focus = 0.5; }
    else if (have) { var set = phone && have.m ? 'm' : 'd'; dir = name + '/' + set; count = have[set]; }
    else count = 0;
    var tier = count ? 'frames' : (meta && MEDIA.ready(meta.start) && MEDIA.ready(meta.end) ? 'stills' : 'board');
    sec.classList.add('film--' + tier);

    /* HUD: beat ticks, and a "pending" tag while the film does not exist */
    var ticks = sec.querySelector('.film__ticks');
    if (ticks && meta) ticks.innerHTML = meta.beats.map(function (b) { return '<i style="left:' + b.at * 100 + '%"></i>'; }).join('');
    var tag = sec.querySelector('.film__tag');
    if (tag && meta) {
      var missing = [meta.start, meta.end].filter(function (id) { return !MEDIA.ready(id); });
      tag.innerHTML = tier === 'frames' ? meta.id + ' · ' + dur + ' s'
        : 'Film pending · ' + meta.id + ' · ' + dur + ' s' + (missing.length ? '<span class="film__tag-x"> · frames ' + missing.join(' + ') + ' pending</span>' : '');
    }

    /* frames: load coarse first so scrubbing works early, then fill in */
    var imgs = [], loaded = [], started = false;
    function load() {
      if (started || !count) return;
      started = true;
      var order = [], seen = {};
      [16, 8, 4, 2, 1].forEach(function (step) {
        for (var i = 0; i < count; i += step) if (!seen[i]) { seen[i] = 1; order.push(i); }
      });
      if (!seen[count - 1]) order.push(count - 1);
      var next = 0, active = 0;
      function pump() {
        while (active < 6 && next < order.length) {
          var i = order[next++], im = new Image();
          active++;
          im.decoding = 'async';
          im.onload = (function (i, im) { return function () { loaded[i] = 1; imgs[i] = im; active--; pump(); draw(true); }; })(i, im);
          im.onerror = function () { active--; pump(); };
          im.src = 'assets/film/' + dir + '/' + String(i + 1).padStart(4, '0') + '.webp';
        }
      }
      pump();
    }
    function nearest(i) {
      for (var d = 0; d < count; d++) {
        if (loaded[i - d]) return i - d;
        if (loaded[i + d]) return i + d;
      }
      return -1;
    }

    var W = 0, H = 0, drawn = -1;
    function size() {
      var r = stage.getBoundingClientRect(), dpr = Math.min(root.devicePixelRatio || 1, 2);
      W = Math.round(r.width * dpr); H = Math.round(r.height * dpr);
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; drawn = -1; }
    }
    function draw(force) {
      if (tier !== 'frames') return;
      var i = nearest(Math.round(q * (count - 1)));
      if (i < 0 || (i === drawn && !force)) return;
      var im = imgs[i], s = Math.max(W / im.naturalWidth, H / im.naturalHeight);
      var w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.drawImage(im, (W - w) * focus, (H - h) / 2, w, h);
      drawn = i;
      if (!sec.classList.contains('has-frame')) sec.classList.add('has-frame');
    }

    /* progress */
    var p = 0, q = 0, raf = 0, last = 0;
    function measure() {
      var r = sec.getBoundingClientRect(), span = sec.offsetHeight - root.innerHeight;
      p = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
      if (r.top < root.innerHeight * 2 && r.bottom > -root.innerHeight) load();
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
    }
    function step(now) {
      raf = 0;
      var dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      q += (p - q) * (UI.reduce() ? 1 : 1 - Math.exp(-dt * 14));
      if (Math.abs(p - q) < 0.0004) q = p;
      paint();
      if (q !== p) raf = requestAnimationFrame(step);
    }
    function paint() {
      draw(false);
      if (tier !== 'frames') {
        var x = smooth((q - 0.28) / 0.5);
        if (stillB) stillB.style.opacity = x.toFixed(3);
        var zoom = UI.reduce() ? 1 : 1 + q * 0.1;
        stillA.style.transform = 'scale(' + zoom.toFixed(4) + ')';
        if (stillB) stillB.style.transform = 'scale(' + (zoom + 0.02).toFixed(4) + ')';
      }
      chaps.forEach(function (c) {
        var a = parseFloat(c.dataset.in), b = parseFloat(c.dataset.out);
        var o = (a <= 0 ? 1 : clamp((q - a) / 0.05, 0, 1)) * (b >= 1 ? 1 : clamp((b - q) / 0.05, 0, 1));
        c.style.opacity = o.toFixed(3);
        c.style.transform = UI.reduce() ? '' : 'translate3d(0,' + ((1 - o) * (q < a ? 24 : -24)).toFixed(1) + 'px,0)';
        c.classList.toggle('is-live', o > 0.5);
      });
      if (bar) bar.style.transform = 'scaleX(' + q.toFixed(4) + ')';
      if (tc) tc.textContent = '00:' + pad(q * dur) + ' / 00:' + pad(dur);
      if (beat && meta) {
        var cur = meta.beats[0];
        meta.beats.forEach(function (b) { if (q >= b.at) cur = b; });
        if (beat.textContent !== cur.text) beat.textContent = cur.text;
      }
    }

    size();
    root.addEventListener('resize', function () { size(); draw(true); measure(); });
    UI.onScroll(measure);
    measure();
  }

  /* A frame sequence on its own, for scenes that draw frames themselves (the Grip Lab):
     HF_SEQ('lab-kelp/d', 61, onFrame) → { count, start(), nearest(i) → <img> | null }. Coarse frames first. */
  root.HF_SEQ = function (dir, count, onFrame) {
    var imgs = [], started = false;
    function start() {
      if (started) return;
      started = true;
      var order = [], seen = {};
      [16, 8, 4, 2, 1].forEach(function (step) { for (var i = 0; i < count; i += step) if (!seen[i]) { seen[i] = 1; order.push(i); } });
      if (!seen[count - 1]) order.push(count - 1);
      var next = 0, active = 0;
      (function pump() {
        while (active < 6 && next < order.length) {
          var i = order[next++], im = new Image();
          active++;
          im.decoding = 'async';
          im.onload = (function (i, im) { return function () { imgs[i] = im; active--; pump(); if (onFrame) onFrame(i); }; })(i, im);
          im.onerror = function () { active--; pump(); };
          im.src = 'assets/film/' + dir + '/' + String(i + 1).padStart(4, '0') + '.webp';
        }
      })();
    }
    function nearest(i) {
      for (var d = 0; d < count; d++) { if (imgs[i - d]) return imgs[i - d]; if (imgs[i + d]) return imgs[i + d]; }
      return null;
    }
    return { count: count, start: start, nearest: nearest };
  };

  Array.prototype.forEach.call(document.querySelectorAll('[data-film]'), function (s) {
    if (s.classList.contains('film')) Film(s);
  });
})(window);
