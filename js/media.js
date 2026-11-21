/*
 * HOLDFAST: image slots.
 *
 *   <figure class="slot" data-shot="kelp-side"></figure>
 *   <figure class="slot slot--fill" data-shot="hero" data-shot-m="hero-m" data-video="hero"></figure>
 *
 * If the shot id is listed in assets/img/ready.js (written by higgsfield/optimize.mjs),
 * the slot loads assets/img/<id>.webp (and <id>-sm.webp for small screens).
 * If not, it draws a placeholder that says exactly which picture belongs there,
 * over that shoe's tread pattern. Nothing ever shows as a broken image.
 */
(function (root) {
  var SHOTS = root.HOLDFAST_SHOTS;
  var READY = root.HOLDFAST_READY || { img: [], video: [] };
  var img = {}, vid = {};
  (READY.img || []).forEach(function (id) { img[id] = 1; });
  (READY.video || []).forEach(function (id) { vid[id] = 1; });

  var ratio = function (a) { var p = a.split(':'); return p[0] + ' / ' + p[1]; };
  var backdrop = function (s) { var m = s.prompt.match(/Backdrop:[^#]*(#[0-9A-Fa-f]{6})/); return m ? m[1] : null; };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function pending(el, s) {
    var bg = backdrop(s);
    el.classList.add('slot--pending', 'slot--' + s.tone);
    if (bg) {
      var n = parseInt(bg.slice(1), 16);
      var lum = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
      if (lum > 0.55) el.classList.add('slot--on-light');
    }
    var tread = root.HF_ART ? root.HF_ART.sole(s.model_of || 'kelp', { className: 'slot__tread', label: '' }) : '';
    el.innerHTML =
      tread +
      '<span class="slot__corner slot__corner--tl"></span><span class="slot__corner slot__corner--tr"></span>' +
      '<span class="slot__corner slot__corner--bl"></span><span class="slot__corner slot__corner--br"></span>' +
      '<figcaption class="slot__note">' +
      '<span class="slot__tag"><b>Image pending</b><span>' + esc(s.id) + '</span><span>' + esc(s.aspect) + '</span></span>' +
      '<span class="slot__brief">' + esc(s.brief) + '</span>' +
      '</figcaption>';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', s.alt + ' (image not produced yet)');
  }

  function picture(el, s, sm) {
    var p = document.createElement('picture');
    if (sm) {
      var src = document.createElement('source');
      src.media = '(max-width: 700px) and (orientation: portrait)';
      src.srcset = 'assets/img/' + sm.id + '-sm.webp 900w, assets/img/' + sm.id + '.webp 2000w';
      src.sizes = '100vw';
      p.appendChild(src);
    }
    var i = document.createElement('img');
    i.src = 'assets/img/' + s.id + '.webp';
    i.srcset = 'assets/img/' + s.id + '-sm.webp 900w, assets/img/' + s.id + '.webp 2000w';
    i.sizes = el.getAttribute('data-sizes') || '100vw';
    i.alt = s.alt;
    i.decoding = 'async';
    if (s.priority) { i.loading = 'eager'; i.setAttribute('fetchpriority', 'high'); } else i.loading = 'lazy';
    if (el.dataset.focus) i.style.objectPosition = el.dataset.focus;
    i.addEventListener('load', function () { el.classList.add('is-loaded'); });
    p.appendChild(i);
    el.innerHTML = '';
    el.appendChild(p);
    el.classList.add('slot--ready');
    if (i.complete) el.classList.add('is-loaded');
  }

  function video(el, id) {
    var v = document.createElement('video');
    v.className = 'slot__video';
    v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = !document.documentElement.classList.contains('reduce');
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.preload = 'auto';
    v.src = 'assets/video/' + id + '.mp4';
    el.appendChild(v);
  }

  function fill(el) {
    var id = el.getAttribute('data-shot');
    var s = SHOTS && SHOTS.byId[id];
    if (!s) { el.textContent = 'Unknown shot: ' + id; return; }
    if (!el.classList.contains('slot--fill')) el.style.aspectRatio = ratio(s.aspect);
    var bg = backdrop(s);
    if (bg) el.style.setProperty('--slot-bg', bg);
    var mid = el.getAttribute('data-shot-m');
    var sm = mid && SHOTS.byId[mid] && img[mid] ? SHOTS.byId[mid] : null;
    var phone = root.matchMedia && root.matchMedia('(max-width: 700px) and (orientation: portrait)').matches;
    if (img[id]) picture(el, s, sm);
    else pending(el, phone && mid && SHOTS.byId[mid] ? SHOTS.byId[mid] : s);
    var v = el.getAttribute('data-video');
    if (v && vid[v]) video(el, v);
  }

  root.HF_MEDIA = {
    fill: fill,
    all: function (scope) {
      Array.prototype.forEach.call((scope || document).querySelectorAll('[data-shot]'), fill);
    },
    ready: function (id) { return !!img[id]; },
  };
})(window);
