/*
 * HOLDFAST: shared behaviour for every page. Logo marks, image slots, the nav,
 * reveals, tread drawing, the bag, the toast and the motion setting.
 */
(function (root) {
  var d = document.documentElement;
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reduce = function () { return d.classList.contains('reduce'); };

  /* logo marks */
  $$('[data-mark]').forEach(function (el) { el.innerHTML = root.HF_ART.mark(); });

  /* image slots */
  root.HF_MEDIA.all();

  /* scroll: one listener, many subscribers */
  var subs = [], ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY;
    for (var i = 0; i < subs.length; i++) subs[i](y);
  }
  function kick() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  var onScroll = function (fn) { subs.push(fn); fn(window.scrollY); };

  /* nav: solid once you leave the top; tucks away while reading down, returns on the way up */
  var nav = document.querySelector('[data-nav]');
  var lastY = 0;
  if (nav) onScroll(function (y) {
    nav.classList.toggle('is-solid', y > 40);
    var down = y > lastY + 4, up = y < lastY - 4;
    if (down && y > window.innerHeight * 0.9) nav.classList.add('is-hidden');
    else if (up || y < 80) nav.classList.remove('is-hidden');
    lastY = y;
  });

  /* smooth scrolling (desktop, full motion). Lenis drives the real window scroll, so scroll events still fire. */
  var lenis = null;
  var touch = root.matchMedia('(hover: none) and (pointer: coarse)').matches;
  var testing = /[?&]sync\b/.test(location.search);
  function smoothOn() {
    if (lenis || reduce() || touch || testing || !root.Lenis) return;
    lenis = new root.Lenis({ autoRaf: true, anchors: { offset: 0 }, lerp: 0.11, wheelMultiplier: 0.95 });
    lenis.on('scroll', kick);
  }
  function smoothOff() { if (lenis) { lenis.destroy(); lenis = null; } }
  smoothOn();

  /* lazy 3D: the bundle (three.js inside) loads only when a 3D view comes near */
  var three = null;
  function load3d(cb) {
    if (root.HF3D) return cb(root.HF3D);
    if (!three) {
      three = [];
      var s = document.createElement('script');
      s.src = 'js/shoe3d.js';
      s.onload = function () { three.forEach(function (f) { f(root.HF3D); }); };
      document.head.appendChild(s);
    }
    three.push(cb);
  }

  /* page transitions (View Transitions API): skip them when motion is reduced */
  function vt(e) {
    var t = e.viewTransition;
    if (!t) return;
    /* a transition the browser aborts (background tab, quick reload) rejects these promises; that is not an error */
    [t.ready, t.finished, t.updateCallbackDone].forEach(function (p) { if (p && p.catch) p.catch(function () {}); });
    if (reduce()) t.skipTransition();
  }
  root.addEventListener('pagereveal', vt);
  root.addEventListener('pageswap', vt);

  /* reveals and tread drawing */
  var io = 'IntersectionObserver' in root ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add(e.target.classList.contains('sole--draw') ? 'is-drawn' : 'is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }) : null;
  function watch(scope) {
    $$('.rv, .rv-clip, .sole--draw', scope).forEach(function (el) {
      if (io && !reduce()) io.observe(el);
      else el.classList.add('is-in', 'is-drawn');
    });
  }
  watch();

  /* toast */
  var toastEl = document.querySelector('[data-toast]'), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  /* bag (front-end only: stored in this browser) */
  var BAG_KEY = 'holdfast.bag';
  function readBag() { try { return JSON.parse(localStorage.getItem(BAG_KEY)) || []; } catch (e) { return []; } }
  function paintBag(bump) {
    var n = readBag().length;
    $$('[data-bag-count]').forEach(function (c) {
      c.textContent = n;
      if (bump) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); setTimeout(function () { c.classList.remove('bump'); }, 450); }
    });
    $$('[data-bag]').forEach(function (b) { b.setAttribute('aria-label', 'Bag, ' + n + (n === 1 ? ' item' : ' items')); });
  }
  function addToBag(item) {
    var bag = readBag();
    bag.push(item);
    try { localStorage.setItem(BAG_KEY, JSON.stringify(bag)); } catch (e) {}
    paintBag(true);
  }
  paintBag(false);
  $$('[data-bag]').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = readBag().length;
      toast(n ? n + (n === 1 ? ' pair' : ' pairs') + ' in your bag. Checkout opens at launch.' : 'Your bag is empty.');
    });
  });

  /* motion setting */
  /* the switch sits top right in the nav: a dot and "Motion on/off"; pressed means motion is reduced */
  var mb = document.querySelector('[data-motion-toggle]');
  function paintMotion() {
    if (!mb) return;
    var r = reduce(), label = mb.querySelector('.nav__motion-label');
    if (label) label.textContent = r ? 'Motion off' : 'Motion on';
    mb.setAttribute('aria-pressed', String(r));
    mb.setAttribute('aria-label', r ? 'Turn motion back on' : 'Reduce motion');
    mb.title = r ? 'Turn motion back on' : 'Reduce motion';
  }
  if (mb) mb.addEventListener('click', function () {
    d.classList.toggle('reduce');
    try { localStorage.setItem('holdfast.motion', reduce() ? 'reduce' : 'full'); } catch (e) {}
    paintMotion();
    $$('video').forEach(function (v) { if (reduce()) v.pause(); else v.play().catch(function () {}); });
    if (reduce()) smoothOff(); else smoothOn();
    kick();
  });
  paintMotion();

  /* glide to a scroll position: through Lenis when it runs, otherwise native (instant when motion is reduced) */
  function scrollToY(y) {
    if (lenis) lenis.scrollTo(y, { duration: 0.9, easing: function (t) { return 1 - Math.pow(1 - t, 3); } });
    else root.scrollTo({ top: y, behavior: reduce() || testing ? 'instant' : 'smooth' });
  }

  root.HF_UI = { $$: $$, onScroll: onScroll, toast: toast, addToBag: addToBag, watch: watch, reduce: reduce, kick: kick, load3d: load3d, scrollToY: scrollToY };
})(window);
