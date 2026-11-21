/*
 * HOLDFAST: the shoe page. One template for the whole range: shoe.html?m=kelp|gecko|octo|limpet
 * Runs before common.js so the slots and reveals it writes are picked up there.
 */
(function (root) {
  var HF = root.HOLDFAST, ART = root.HF_ART, MEDIA = root.HF_MEDIA;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  var id = new URLSearchParams(location.search).get('m');
  var m = HF.byId[id] || HF.byId.kelp;
  document.title = m.name + ' · ' + m.kind + ' · Holdfast';
  document.documentElement.style.setProperty('--pdp-accent', m.accent);

  var text = {
    name: m.name, kind: m.kind, learned: m.learned, price: '$' + m.price, terrain: m.terrain, line: m.line, color: m.color,
    'how-title': 'Copied from ' + m.learned + '.', 'how-animal': m.how.animal, 'how-sole': m.how.sole,
  };
  Array.prototype.forEach.call(document.querySelectorAll('[data-p]'), function (el) { el.textContent = text[el.dataset.p]; });

  /* gallery: four photos and a live 3D view. The frame and the name morph from the home page card. */
  var VIEWS = [['side', 'Side'], ['pair', 'Pair'], ['sole', 'Sole'], ['field', 'In use'], ['3d', '3D']];
  var frame = $('[data-gallery-frame]'), main = $('[data-gallery-main]'), thumbs = $('[data-gallery-thumbs]');
  var box3d = $('[data-view3d]'), canvas3d = $('[data-view3d-canvas]'), view3d = null;
  frame.style.viewTransitionName = 'shoe-' + m.id;
  $('#pdp-name').style.viewTransitionName = 'name-' + m.id;
  var READY = root.HOLDFAST_READY || {};
  var glb = (READY.model3d || []).indexOf(m.id) > -1 ? 'assets/3d/' + m.id + '.glb' : null;
  $('[data-view3d-tag]').textContent = glb ? '3D model · ' + m.name : 'Real-time 3D · drawn from the ' + m.name + ' tread';
  canvas3d.setAttribute('aria-label', 'A 3D ' + m.name + ' you can turn by dragging.');

  function start3d() {
    if (view3d) return;
    root.HF_UI.load3d(function (H) {
      if (!H.supported()) { box3d.classList.add('is-off'); return; }
      view3d = H.create(canvas3d, {
        model: m.id, mat: m.mat, mode: 'viewer', glb: glb,
        /* a scanned model is one mesh, so it cannot come apart: hide that button */
        onGlb: function () { var b = box3d.querySelector('[data-v="explode"]'); if (b) b.hidden = true; },
      });
    });
  }
  function show(view) {
    var is3d = view === '3d';
    box3d.hidden = !is3d;
    main.hidden = is3d;
    if (is3d) start3d();
    else {
      main.setAttribute('data-shot', m.id + '-' + view);
      main.className = 'slot' + (view === 'field' ? '' : ' slot--contain');
      main.removeAttribute('style');
      MEDIA.fill(main);
    }
    Array.prototype.forEach.call(thumbs.children, function (t) { t.setAttribute('aria-current', String(t.dataset.view === view)); });
  }
  thumbs.innerHTML = VIEWS.map(function (v) {
    var inner = v[0] === '3d'
      ? '<span class="gallery__thumb-3d">' + ART.sole(m.id, { label: '' }) + '</span>'
      : '<figure class="slot" data-shot="' + m.id + '-' + v[0] + '" data-sizes="160px"></figure>';
    return '<button class="gallery__thumb" type="button" data-view="' + v[0] + '" aria-label="Show ' + (v[0] === '3d' ? 'the 3D view' : v[1].toLowerCase() + ' view') + '">' +
      inner + '<span class="gallery__thumb-label">' + v[1] + '</span></button>';
  }).join('');
  thumbs.addEventListener('click', function (e) { var b = e.target.closest('[data-view]'); if (b) show(b.dataset.view); });
  $('[data-view3d] .view3d__btns').addEventListener('click', function (e) {
    var b = e.target.closest('[data-v]');
    if (!b || !view3d) return;
    view3d.setView(b.dataset.v);
    if (b.dataset.v === 'three') view3d.spin(true);
    Array.prototype.forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
  });
  /* lead with the photo once it exists; until then, the 3D shoe is the best thing to show */
  var lead = MEDIA.ready(m.id + '-side') ? 'side' : '3d';
  if (lead === '3d') document.addEventListener('DOMContentLoaded', function () { show('3d'); });
  else show('side');

  /* colour */
  $('[data-swatches]').innerHTML =
    '<span class="swatch" title="' + esc(m.color) + '"><span style="background:conic-gradient(' + m.swatch[0] + ' 0 50%,' + m.swatch[1] + ' 50% 80%,' + m.swatch[2] + ' 80%)"></span></span>' +
    '<span class="swatch swatch--soon" title="More colours soon"><span style="background:transparent"></span></span>';

  /* sizes: a couple shown as sold out so the state is designed */
  var SIZES = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'];
  var OUT = { kelp: ['7', '12'], gecko: ['13'], octo: ['7.5', '11.5'], limpet: ['8'] }[m.id] || [];
  var sizesEl = $('[data-size-grid]'), hint = $('[data-hint]'), chosen = null;
  sizesEl.innerHTML = SIZES.map(function (s) {
    var out = OUT.indexOf(s) > -1;
    return '<button class="size" type="button" role="radio" aria-checked="false" data-size="' + s + '"' +
      (out ? ' aria-disabled="true" aria-label="' + s + ', sold out"' : '') + '>' + s + '</button>';
  }).join('');
  sizesEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-size]');
    if (!b) return;
    if (b.getAttribute('aria-disabled') === 'true') { hint.classList.remove('is-err'); hint.textContent = 'US ' + b.dataset.size + ' is sold out. Restocks are announced to the list first.'; return; }
    chosen = b.dataset.size;
    Array.prototype.forEach.call(sizesEl.children, function (c) { c.setAttribute('aria-checked', String(c === b)); });
    hint.classList.remove('is-err');
    hint.textContent = 'US ' + chosen + ' selected.';
  });
  $('[data-add]').addEventListener('click', function () {
    if (!chosen) {
      hint.classList.add('is-err');
      hint.textContent = 'Pick a size first.';
      sizesEl.querySelector('.size:not([aria-disabled])').focus();
      return;
    }
    root.HF_UI.addToBag({ id: m.id, size: chosen });
    hint.classList.remove('is-err');
    hint.textContent = m.name + ', US ' + chosen + ', added to your bag.';
    root.HF_UI.toast('Added: ' + m.name + ' · US ' + chosen);
  });

  /* how it grips */
  var nature = $('[data-how-nature]');
  nature.setAttribute('data-shot', 'nature-' + m.id);
  $('[data-how-sole]').innerHTML = ART.sole(m.id, { className: 'sole--draw', label: 'The ' + m.name + ' outsole, drawn' });

  /* specs and grip meters */
  var LABEL = { weight: 'Weight (US 9)', drop: 'Heel-to-toe drop', stack: 'Stack, heel / toe', lug: 'Lug depth', rubber: 'Rubber' };
  $('[data-specs]').innerHTML = '<tbody>' + Object.keys(m.specs).map(function (k) {
    return '<tr><th scope="row">' + LABEL[k] + '</th><td>' + esc(m.specs[k]) + '</td></tr>';
  }).join('') + '<tr><th scope="row">Wet-granite friction</th><td>μ ' + m.mu.toFixed(2) + '</td></tr></tbody>';
  $('[data-meters]').innerHTML = Object.keys(m.grip).map(function (k) {
    var v = m.grip[k], bars = '';
    for (var i = 1; i <= 5; i++) bars += '<b class="' + (i <= v ? 'on' : '') + '"></b>';
    return '<div class="meter"><span>' + esc(k) + '</span><i role="img" aria-label="' + v + ' out of 5">' + bars + '</i></div>';
  }).join('');

  /* the rest of the range */
  $('[data-others]').innerHTML = HF.models.filter(function (o) { return o.id !== m.id; }).map(function (o) {
    return '<a class="other" href="shoe.html?m=' + o.id + '"><div style="view-transition-name:shoe-' + o.id + '"><figure class="slot" data-shot="' + o.id + '-side" data-sizes="(max-width: 800px) 100vw, 33vw"></figure></div>' +
      '<span class="other__name"><span style="view-transition-name:name-' + o.id + '">' + esc(o.name) + '</span> <small>' + esc(o.kind) + ' · $' + o.price + '</small></span></a>';
  }).join('');
})(window);
