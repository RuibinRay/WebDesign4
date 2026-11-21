/*
 * HOLDFAST: home page. Hero settle, the shoe cards, the Grip Lab, the ramp
 * test, the pinned field gallery and the Kelp anatomy pins.
 */
(function (root) {
  var HF = root.HOLDFAST, ART = root.HF_ART, UI = root.HF_UI, MEDIA = root.HF_MEDIA;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var deg = function (mu) { return Math.atan(mu) * 180 / Math.PI; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ───────────── 03 CARDS (the image and name morph into the shoe page: see View Transitions in the CSS) ───────────── */
  Array.prototype.forEach.call(document.querySelectorAll('[data-cards]'), function (cards) {
    var sport = cards.dataset.cards === 'sport', list = sport ? HF.sport : HF.shore;
    cards.innerHTML = list.map(function (m, i) {
      return (
        '<a class="card rv" href="shoe.html?m=' + m.id + '" style="--card-accent:' + m.accent + '">' +
        '<div class="card__media" style="view-transition-name:shoe-' + m.id + '"><figure class="slot" data-shot="' + m.id + '-side" data-sizes="(max-width: 820px) 100vw, 50vw"></figure></div>' +
        '<div class="card__body">' +
        '<div><p class="card__idx">' + (sport ? esc(m.sport) : '03.' + (i + 1)) + ' · Learned from ' + esc(m.learned) + '</p>' +
        '<h3 class="card__name" style="view-transition-name:name-' + m.id + '">' + esc(m.name) + '</h3>' +
        '<p class="card__kind">' + esc(m.kind) + '</p></div>' +
        ART.sole(m.id, { className: 'card__sole sole--draw', label: m.name + ' tread' }) +
        '<p class="card__facts"><span>' + esc(m.terrain) + '</span><span><b>$' + m.price + '</b></span><span class="card__go">View</span></p>' +
        '</div></a>'
      );
    }).join('');
    MEDIA.all(cards);
    UI.watch(cards);
  });

  /* ───────────── 03 SPORT: pinned. One chapter per sport. The real-time 3D shoe is rebuilt for each
     (its form in data.js: high-top, studs, carbon plate…), turns as you scroll and opens a little in the
     middle of the chapter; the stage takes that shoe's colour, its tread draws itself, a giant word slides past. ───────────── */
  var sp = $('[data-sport]');
  if (sp) {
    var SP = HF.sport, SN = SP.length, spChapter = -1, spQ = 0, spView = null, spAsked = false;
    var spTabs = $('[data-sport-tabs]', sp), spInfo = $('[data-sport-info]', sp), spSole = $('[data-sport-sole]', sp);
    var spWord = $('[data-sport-word]', sp), spN = $('[data-sport-n]', sp), spCanvas = $('[data-sport-canvas]', sp), spFb = $('[data-sport-fallback]', sp);
    var spSvg = null, pad = function (n) { return (n < 10 ? '0' : '') + n; };
    /* the textured Higgsfield model where one exists; the drawn build otherwise */
    var GLB = ((root.HOLDFAST_READY || {}).model3d || []);
    var glbOf = function (m) { return GLB.indexOf(m.id) > -1 ? 'assets/3d/' + m.id + '.glb' : null; };
    var SPEC = { weight: 'Weight', drop: 'Drop', stack: 'Stack', lug: 'Grip', plate: 'Plate', cut: 'Cut' };

    spTabs.innerHTML = SP.map(function (m, i) {
      return '<button class="sport__tab" role="tab" id="sptab-' + m.id + '" data-i="' + i + '" aria-selected="false" aria-controls="sport-panel" aria-label="' + esc(m.sport) + ': ' + esc(m.name) + '"><small>' + pad(i + 1) + '</small><span>' + esc(m.sport) + '</span><i class="lab__bar" aria-hidden="true"><b></b></i></button>';
    }).join('');

    var spChapterTo = function (i) {
      if (i === spChapter) return;
      spChapter = i;
      var m = SP[i];
      Array.prototype.forEach.call(spTabs.children, function (t, k) { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      sp.style.setProperty('--st-bg', m.stage);
      sp.style.setProperty('--st-accent', m.accent);
      sp.classList.toggle('is-dark-ink', m.ink === 'dark');
      spWord.textContent = m.word;
      spN.textContent = pad(i + 1) + ' / ' + pad(SN);
      var keys = Object.keys(SPEC).filter(function (k) { return m.specs[k]; }).slice(0, 4);
      spInfo.innerHTML =
        '<p class="sport__kicker">' + pad(i + 1) + ' · ' + esc(m.sport) + '</p>' +
        '<h3 class="sport__name">' + esc(m.name) + '</h3>' +
        '<p class="sport__kind">' + esc(m.kind) + ' · learned from ' + esc(m.learned) + '</p>' +
        '<p class="sport__line">' + esc(m.line) + '</p>' +
        '<dl class="sport__specs">' + keys.map(function (k) { return '<div><dt>' + SPEC[k] + '</dt><dd>' + esc(m.specs[k]) + '</dd></div>'; }).join('') + '</dl>' +
        '<a class="sport__go" href="shoe.html?m=' + m.id + '">View the ' + esc(m.name) + ' <b>$' + m.price + '</b></a>';
      spInfo.setAttribute('aria-labelledby', 'sptab-' + m.id);
      spSole.innerHTML = '<span class="sport__sole-tag">Outsole · ' + esc(m.name) + '</span>' + ART.sole(m.id, { className: 'sole--scrub', label: 'The ' + m.name + ' outsole, drawn' });
      spSvg = spSole.querySelector('svg');
      spFb.innerHTML = ART.sole(m.id, { label: '' });
      if (spView) spView.setModel(m.id, m.mat, m.form, glbOf(m));
    };
    var spPaint = function () {
      var q = spQ, still = UI.reduce();
      if (spSvg) spSvg.style.setProperty('--draw', (1 - clamp(q / 0.6, 0, 1)).toFixed(3));
      spWord.style.transform = still ? '' : 'translate3d(' + ((0.5 - q) * 24).toFixed(2) + 'vw,0,0)';
      if (spView) {
        /* from a front three-quarter, past the side, to a rear three-quarter; it opens a little mid-turn */
        var open = Math.pow(Math.sin(q * Math.PI), 2);
        spView.setPose(0.2 + 0.12 * open, -2.35 + q * 1.6, still ? 0 : 0.42 * open);
      }
    };
    var spUpdate = function () {
      var r = sp.getBoundingClientRect(), span = sp.offsetHeight - window.innerHeight;
      if (!spAsked && r.top < window.innerHeight * 2.5 && r.bottom > -window.innerHeight) {
        spAsked = true;
        UI.load3d(function (H) {
          if (!H.supported()) { sp.classList.add('no-3d'); return; }
          var m = SP[Math.max(0, spChapter)];
          spView = H.create(spCanvas, { model: m.id, mat: m.mat, form: m.form, mode: 'stage', glb: glbOf(m) });
          spCanvas.setAttribute('aria-label', 'A real-time 3D view of the Holdfast sport shoes, one per sport. Drag to turn it.');
          sp.classList.add('has-3d');
          spPaint();
        });
      }
      var x = (span > 0 ? clamp(-r.top / span, 0, 1) : 0) * SN;
      var i = Math.min(SN - 1, Math.floor(x));
      spQ = i === SN - 1 && x >= SN ? 1 : clamp(x - i, 0, 1);
      spChapterTo(i);
      Array.prototype.forEach.call(spTabs.children, function (t, k) { t.style.setProperty('--fill', k < i ? 1 : k === i ? spQ.toFixed(3) : 0); });
      spPaint();
    };
    var spGo = function (i) {
      var span = sp.offsetHeight - window.innerHeight, top = sp.getBoundingClientRect().top + window.scrollY;
      UI.scrollToY(top + ((i + 0.3) / SN) * span);
    };
    spTabs.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) spGo(Number(b.dataset.i)); });
    spTabs.addEventListener('keydown', function (e) {
      var next = { ArrowRight: spChapter + 1, ArrowLeft: spChapter - 1, Home: 0, End: SN - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      next = (next + SN) % SN;
      spGo(next);
      spTabs.children[next].focus();
    });
    UI.onScroll(spUpdate);
    spUpdate();
  }

  /* ───────────── 04 GRIP LAB: pinned. Scrolling plays each animal's Higgsfield film in turn
     (assets/film/lab-<id>/d), while that shoe's tread draws itself. One chapter per animal. ───────────── */
  var LAB = HF.shore, labEl = $('[data-labscroll]'), tabs = $('[data-lab-tabs]'), stage = $('[data-lab-stage]');
  if (labEl && tabs) {
    var natureEl = $('[data-lab-nature]'), soleEl = $('[data-lab-sole]'), textEl = $('[data-lab-text]');
    var labCanvas = $('[data-lab-canvas]'), labCtx = labCanvas.getContext('2d'), clock = $('[data-lab-clock]');
    var LABFILMS = (root.HOLDFAST_READY || {}).film || {};
    var N = LAB.length, seqs = {}, chapter = -1, q = 0, soleSvg = null, drawnImg = null;
    LAB.forEach(function (m) {
      var f = LABFILMS['lab-' + m.id];
      if (f && f.d && root.HF_SEQ) seqs[m.id] = root.HF_SEQ('lab-' + m.id + '/d', f.d, function () { if (LAB[chapter] === m) paintLab(true); });
    });

    tabs.innerHTML = LAB.map(function (m) {
      return '<button class="lab__tab" role="tab" id="tab-' + m.id + '" data-id="' + m.id + '" aria-selected="false"><small>' + esc(m.learned.replace('the ', '')) + '</small><span>' + esc(m.name) + '</span><i class="lab__bar" aria-hidden="true"><b></b></i></button>';
    }).join('');

    var sizeLab = function () {
      var r = labCanvas.getBoundingClientRect(), dpr = Math.min(root.devicePixelRatio || 1, 2);
      labCanvas.width = Math.max(1, Math.round(r.width * dpr));
      labCanvas.height = Math.max(1, Math.round(r.height * dpr));
      drawnImg = null;
    };
    var setChapter = function (i) {
      if (i === chapter) return;
      chapter = i;
      var m = LAB[i];
      Array.prototype.forEach.call(tabs.children, function (t, k) { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      natureEl.setAttribute('data-shot', 'nature-' + m.id);
      natureEl.className = 'slot slot--fill lab__nature';
      natureEl.removeAttribute('style');
      MEDIA.fill(natureEl);
      textEl.innerHTML =
        '<div><p class="label"><span>' + esc(m.name) + '</span> Learned from ' + esc(m.learned) + '</p></div>' +
        '<div class="step step--animal"><small>How it holds</small><p>' + esc(m.how.animal) + '</p></div>' +
        '<div class="step step--sole"><small>How the sole copies it</small><p>' + esc(m.how.sole) + '</p></div>' +
        '<a href="shoe.html?m=' + m.id + '">Shop the ' + esc(m.name) + ' · $' + m.price + ' →</a>';
      textEl.setAttribute('aria-labelledby', 'tab-' + m.id);
      stage.style.setProperty('--lab-accent', m.accent);
      soleEl.innerHTML = '<span class="lab__sole-tag">Outsole · ' + esc(m.name) + '</span>' + ART.sole(m.id, { className: 'sole--scrub', label: 'The ' + m.name + ' outsole, drawn' });
      soleSvg = soleEl.querySelector('svg');
      stage.classList.toggle('has-film', !!seqs[m.id]);
      stage.classList.remove('has-frame');
      sizeLab();
      labCtx.clearRect(0, 0, labCanvas.width, labCanvas.height);
      if (seqs[m.id]) seqs[m.id].start();
      var nxt = LAB[i + 1];
      if (nxt && seqs[nxt.id]) seqs[nxt.id].start();
    };
    var paintLab = function (force) {
      var m = LAB[chapter];
      if (!m) return;
      /* the tread draws during the first 70% of the chapter, then holds */
      if (soleSvg) soleSvg.style.setProperty('--draw', (1 - clamp(q / 0.7, 0, 1)).toFixed(3));
      clock.textContent = '00:0' + (q * 5).toFixed(1) + ' / 00:05.0';
      var s = seqs[m.id];
      if (s) {
        var im = s.nearest(Math.round(q * (s.count - 1)));
        if (im && (im !== drawnImg || force)) {
          var W = labCanvas.width, H = labCanvas.height, k = Math.max(W / im.naturalWidth, H / im.naturalHeight);
          labCtx.drawImage(im, (W - im.naturalWidth * k) / 2, (H - im.naturalHeight * k) / 2, im.naturalWidth * k, im.naturalHeight * k);
          drawnImg = im;
          stage.classList.add('has-frame');
        }
      } else if (!UI.reduce()) {
        natureEl.style.transform = 'scale(' + (1 + q * 0.08).toFixed(4) + ')'; /* no film yet: a slow push-in on the still */
      }
    };
    var labUpdate = function () {
      var r = labEl.getBoundingClientRect(), span = labEl.offsetHeight - window.innerHeight;
      var x = (span > 0 ? clamp(-r.top / span, 0, 1) : 0) * N;
      var i = Math.min(N - 1, Math.floor(x));
      q = clamp(x - i, 0, 1);
      if (i === N - 1 && x >= N) q = 1;
      setChapter(i);
      Array.prototype.forEach.call(tabs.children, function (t, k) { t.style.setProperty('--fill', k < i ? 1 : k === i ? q.toFixed(3) : 0); });
      stage.classList.toggle('is-second', q > 0.5);
      paintLab(false);
    };
    var labTop = function () { return labEl.getBoundingClientRect().top + window.scrollY; };
    var goChapter = function (i) {
      var span = labEl.offsetHeight - window.innerHeight;
      UI.scrollToY(labTop() + ((i + 0.04) / N) * span);
    };
    tabs.addEventListener('click', function (e) { var b = e.target.closest('[data-id]'); if (b) goChapter(Array.prototype.indexOf.call(tabs.children, b)); });
    tabs.addEventListener('keydown', function (e) {
      var next = { ArrowRight: chapter + 1, ArrowLeft: chapter - 1, Home: 0, End: N - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      next = (next + N) % N;
      goChapter(next);
      tabs.children[next].focus();
    });
    root.addEventListener('resize', function () { sizeLab(); paintLab(true); });
    UI.onScroll(labUpdate);
  }

  /* ───────────── THE RAMP TEST ───────────── */
  var ramp = $('[data-ramp]');
  if (ramp) {
    var svg = $('[data-ramp-svg]'), input = $('[data-ramp-input]'), out = $('[data-ramp-out]'), readout = $('[data-ramp-readout]'), pick = $('[data-ramp-pick]');
    var NS = 'http://www.w3.org/2000/svg';
    var current = HF.byId.kelp;
    /* two ramps side by side, hinged at their lower-left corner */
    var Y = 318, LEN = 350;
    var lanes = [
      { key: 'base', x: 34, label: HF.baseline.name, mu: function () { return HF.baseline.mu; }, upper: '#5b625e', sole: '#2a2e2c' },
      { key: 'hf', x: 444, label: 'Holdfast', mu: function () { return current.mu; }, upper: '#edefe8', sole: '#0e1110' },
    ];
    var html = '<defs><pattern id="wet" width="46" height="16" patternUnits="userSpaceOnUse"><path d="M4 5h18M28 11h12" stroke="rgba(237,239,232,.22)" stroke-width="1.4" stroke-linecap="round"/></pattern></defs>';
    lanes.forEach(function (l) {
      html +=
        '<line x1="' + l.x + '" y1="' + (Y + 18) + '" x2="' + (l.x + LEN) + '" y2="' + (Y + 18) + '" stroke="rgba(237,239,232,.18)" stroke-dasharray="2 6"/>' +
        '<g class="ramp__lane" data-lane="' + l.key + '" style="transform-origin:' + l.x + 'px ' + (Y + 18) + 'px">' +
        '<rect x="' + l.x + '" y="' + Y + '" width="' + LEN + '" height="18" fill="#3a413d"/>' +
        '<rect x="' + l.x + '" y="' + Y + '" width="' + LEN + '" height="18" fill="url(#wet)"/>' +
        '<rect x="' + l.x + '" y="' + Y + '" width="' + LEN + '" height="2" fill="#7c8680"/>' +
        '<g class="ramp__shoe" data-shoe="' + l.key + '"><g transform="translate(' + (l.x + 150) + ' ' + (Y - 48) + ') scale(.5)">' + ART.shoe({ upper: l.upper, sole: l.sole }).replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</g></g>' +
        '</g>' +
        '<path data-arc="' + l.key + '" fill="none" stroke="#c9f03c" stroke-width="1.5" stroke-dasharray="3 4"/>' +
        '<circle cx="' + l.x + '" cy="' + (Y + 18) + '" r="6" fill="#c9f03c"/>';
    });
    svg.setAttribute('viewBox', '0 56 830 300');
    svg.insertAdjacentHTML('beforeend', html);

    pick.innerHTML = HF.shore.map(function (m) {
      return '<button type="button" role="radio" data-id="' + m.id + '" aria-checked="' + (m.id === 'kelp') + '">' + esc(m.name) + '</button>';
    }).join('');
    pick.addEventListener('click', function (e) {
      var b = e.target.closest('[data-id]');
      if (!b) return;
      current = HF.byId[b.dataset.id];
      Array.prototype.forEach.call(pick.children, function (c) { c.setAttribute('aria-checked', String(c === b)); });
      update();
    });

    function arc(l, a) {
      var r = 96, rad = a * Math.PI / 180, cy = Y + 18;
      var x = l.x + r * Math.cos(rad), y = cy - r * Math.sin(rad);
      return 'M' + (l.x + r) + ' ' + cy + 'A' + r + ' ' + r + ' 0 0 0 ' + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    function update() {
      var a = Number(input.value);
      out.textContent = a + '°';
      var rows = '';
      lanes.forEach(function (l) {
        var lane = svg.querySelector('[data-lane="' + l.key + '"]');
        var shoe = svg.querySelector('[data-shoe="' + l.key + '"]');
        var limit = deg(l.mu());
        lane.style.transform = 'rotate(' + -a + 'deg)';
        svg.querySelector('[data-arc="' + l.key + '"]').setAttribute('d', a > 0.5 ? arc(l, a) : '');
        var slip = a > limit;
        if (slip && !shoe.classList.contains('is-slipping')) {
          shoe.classList.add('is-slipping');
          shoe.style.transform = 'translateX(-300px)';
          shoe.style.opacity = '0';
        } else if (!slip && shoe.classList.contains('is-slipping')) {
          shoe.classList.remove('is-slipping');
          shoe.style.transform = '';
          shoe.style.opacity = '';
        }
        var name = l.key === 'hf' ? 'Holdfast ' + current.name : l.label;
        rows += '<div class="ramp__row"><b class="ramp__name">' + esc(name) + '</b><span>μ ' + l.mu().toFixed(2) + ' · holds to ' + Math.floor(limit) + '°</span>' +
          '<b class="ramp__chip' + (slip ? ' is-slip' : '') + '">' + (slip ? 'Slipping' : 'Holding') + '</b></div>';
      });
      readout.innerHTML = rows;
      input.setAttribute('aria-valuetext', a + ' degrees');
    }
    var auto = null;
    input.addEventListener('input', function () { if (auto) { cancelAnimationFrame(auto); auto = null; } update(); });
    update();

    /* first time the rig is on screen, tilt it once to show the point */
    if ('IntersectionObserver' in root) {
      var demo = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        demo.disconnect();
        if (UI.reduce() || input.value !== '0') return;
        var t0 = performance.now(), D = 2600, TO = 31;
        (function step(t) {
          var p = Math.min(1, (t - t0) / D);
          var e = 1 - Math.pow(1 - p, 3);
          input.value = Math.round(e * TO);
          update();
          if (p < 1) auto = requestAnimationFrame(step); else auto = null;
        })(t0);
      }, { threshold: 0.6 });
      demo.observe($('.ramp__rig'));
    }
  }

  /* ───────────── 04 FIELD: pinned horizontal gallery ───────────── */
  var field = $('[data-field]'), track = $('[data-field-track]'), bar = $('[data-field-bar]');
  if (field && track) {
    var PLACE = {
      kelp: 'Wet basalt · cold-water coast · 07:10',
      gecko: 'Painted crossing · city rain · 23:40',
      octo: 'Weed-covered jetty · low tide · 12:05',
      limpet: 'Granite slab · meltwater · 06:30',
      cheetah: 'Empty highway · rain at dawn · 05:52',
      frog: 'Street court · after the storm · 19:15',
      mako: 'Floodlit pitch · driving rain · 21:30',
      ibex: 'Ridge step · cloud and drizzle · 10:40',
      beetle: 'Forest descent · mud and roots · 16:20',
      spider: 'Clay court · after a shower · 17:45',
    };
    track.innerHTML = HF.models.map(function (m) {
      return '<article class="field__panel"><figure class="slot" data-shot="' + m.id + '-field" data-sizes="75vw"></figure>' +
        '<p class="field__cap"><span><b>' + esc(m.name) + '</b> · ' + esc(PLACE[m.id]) + '</span><a href="shoe.html?m=' + m.id + '">Shop →</a></p></article>';
    }).join('');
    MEDIA.all(track);
    var pinned = root.matchMedia('(min-width: 761px) and (min-height: 521px)');
    var dist = 0;
    function size() {
      if (!pinned.matches) { field.style.height = ''; track.style.transform = ''; return; }
      dist = Math.max(0, track.scrollWidth - track.clientWidth);
      field.style.height = (window.innerHeight + dist) + 'px';
    }
    size();
    window.addEventListener('resize', size);
    if (pinned.addEventListener) pinned.addEventListener('change', size);
    UI.onScroll(function (y) {
      if (!pinned.matches) return;
      var top = field.offsetTop, h = field.offsetHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, (y - top) / h)) : 0;
      track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
      if (bar) bar.style.setProperty('--p', p.toFixed(4));
    });
  }

  /* ───────────── 05 THE KELP IN 3D: scrolling takes it apart, one layer per step ───────────── */
  var STEPS = [
    { t: 'Holdfast lugs', d: '5 mm root-shaped lugs in a wet-grip rubber. Each cluster spreads the load across many small edges.' },
    { t: 'Toe wrap and toe spring', d: 'The lugs climb over the toe tip. When your foot rolls forward off a ledge, the edge of the shoe grips too.' },
    { t: 'Ribbed midsole', d: 'Deep horizontal ribs let the foam flex side to side, so the outsole stays flat on rock that is not.' },
    { t: 'Sealed mesh upper', d: 'A thin matte film over the knit keeps sand and salt out. Water that gets in drains through the midsole.' },
    { t: 'Heel loop and anchor counter', d: 'A firm heel cup locks the foot down, so the sole takes the load on a sideways slope, not your ankle.' },
  ];
  var ex = $('[data-explode]');
  if (ex) {
    var stepsEl = $('[data-steps]'), stepN = $('[data-step-n]'), canvas3d = $('[data-3d]'), fb = $('[data-3d-fallback]');
    stepsEl.innerHTML = STEPS.map(function (s, i) {
      return '<li data-i="' + (i + 1) + '"><span class="n">0' + (i + 1) + '</span><div><h3>' + esc(s.t) + '</h3><p>' + esc(s.d) + '</p></div></li>';
    }).join('');
    fb.innerHTML = ART.sole('kelp', { className: 'explode__sole', label: 'The Kelp outsole' });
    var view = null, active = -1, asked = false;
    var stepTo = function (n) {
      if (n === active) return;
      active = n;
      Array.prototype.forEach.call(stepsEl.children, function (li) { li.classList.toggle('is-on', Number(li.dataset.i) === n); });
      stepsEl.classList.toggle('has-on', n > 0);
      stepN.textContent = '0' + n + ' / 05';
    };
    var exUpdate = function () {
      var r = ex.getBoundingClientRect(), span = ex.offsetHeight - window.innerHeight;
      var p = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
      if (!asked && r.top < window.innerHeight * 2.5) {
        asked = true;
        UI.load3d(function (H) {
          if (!H.supported()) { ex.classList.add('no-3d'); return; }
          view = H.create(canvas3d, { model: 'kelp', mat: HF.byId.kelp.mat, mode: 'explode' });
          ex.classList.add('has-3d');
          exUpdate();
        });
      }
      stepTo(view ? view.setProgress(p) : Math.round(p * 5));
    };
    UI.onScroll(exUpdate);

    /* Settle: when scrolling stops between two steps while the section is pinned, glide to the nearest step,
       so the shoe is never left half-turned. Steps sit at p = 0, 1/5 … 1 (the poses K in shoe3d.src.js). */
    var settleT = 0, settling = false;
    UI.onScroll(function () {
      clearTimeout(settleT);
      if (settling) return;
      settleT = setTimeout(function () {
        var r = ex.getBoundingClientRect(), span = ex.offsetHeight - window.innerHeight;
        if (span <= 0 || r.top > 0 || r.bottom < window.innerHeight) return;
        var x = clamp(-r.top / span, 0, 1) * 5, n = Math.round(x);
        if (Math.abs(x - n) < 0.06) return;
        settling = true;
        UI.scrollToY(window.scrollY + ((n / 5) * span + r.top));
        setTimeout(function () { settling = false; }, 1000);
      }, 220);
    });

    /* arrow keys step through it while it is on screen */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      if (/input|textarea|select/i.test((document.activeElement || {}).tagName || '')) return;
      var r = ex.getBoundingClientRect(), span = ex.offsetHeight - window.innerHeight;
      if (r.top > 0 || r.bottom < window.innerHeight) return;
      var n = Math.round(clamp(-r.top / span, 0, 1) * 5) + (e.key === 'ArrowDown' ? 1 : -1);
      if (n < 0 || n > 5) return;
      e.preventDefault();
      UI.scrollToY(window.scrollY + ((n / 5) * span + r.top));
    });
  }

  /* ───────────── TIDE LINES: the wave edge between dark and light rolls with the scroll ───────────── */
  Array.prototype.forEach.call(document.querySelectorAll('[data-tide]'), function (t) {
    var path = t.querySelector('path');
    var wave = function (y) {
      var r = t.getBoundingClientRect();
      if (r.bottom < -60 || r.top > window.innerHeight + 60) return;
      var k = clamp(1 - r.top / window.innerHeight, 0, 1);
      var still = UI.reduce();
      var phase = still ? 0 : y * 0.005, amp = still ? 14 : 8 + 26 * Math.sin(k * Math.PI);
      var d = 'M0 140L0 ';
      for (var x = 0; x <= 1440; x += 30) {
        var yy = 72 + amp * Math.sin(x * 0.0055 + phase) + amp * 0.42 * Math.sin(x * 0.0141 - phase * 1.7);
        d += (x ? 'L' + x + ' ' : '') + yy.toFixed(1);
      }
      path.setAttribute('d', d + 'L1440 140Z');
    };
    UI.onScroll(wave);
  });

  /* ───────────── SECTION GAUGE: a tide gauge down the right edge ───────────── */
  var gauge = $('[data-gauge-nav]');
  if (gauge) {
    var secs = Array.prototype.slice.call(document.querySelectorAll('[data-gauge]'));
    gauge.innerHTML = '<span class="gauge__line"><i></i></span>' + secs.map(function (s) {
      return '<a class="gauge__item" href="#' + s.id + '"><span class="gauge__label">' + esc(s.dataset.gauge) + '</span><span class="gauge__dot"></span></a>';
    }).join('');
    var items = gauge.querySelectorAll('.gauge__item'), fill = gauge.querySelector('.gauge__line i'), cur = -1;
    UI.onScroll(function (y) {
      var line = window.innerHeight * 0.45, n = 0;
      secs.forEach(function (s, i) { if (s.getBoundingClientRect().top <= line) n = i; });
      if (n !== cur) {
        cur = n;
        Array.prototype.forEach.call(items, function (a, i) { a.classList.toggle('is-on', i === n); if (i === n) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      }
      var lightNow = secs[n].hasAttribute('data-light');
      gauge.classList.toggle('gauge--light', lightNow);
      gauge.classList.toggle('is-shown', y > window.innerHeight * 0.5);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.transform = 'scaleY(' + (max > 0 ? y / max : 0).toFixed(4) + ')';
    });
  }

  /* ───────────── SIGN-UP (front end only until a list provider is connected) ───────────── */
  var form = $('[data-signup]');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = form.querySelector('input'), msg = $('[data-signup-msg]');
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    msg.classList.toggle('is-err', !ok);
    msg.textContent = ok ? 'You’re on the list. First field test lands soon.' : 'That email doesn’t look right. Check it and try again.';
    if (ok) form.reset();
    else input.focus();
  });
})(window);
