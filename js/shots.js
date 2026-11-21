/*
 * HOLDFAST: every image the site needs, as data.
 *
 * One file feeds three things:
 *   1. the website (alt text, ratio, the brief shown in each placeholder)
 *   2. higgsfield/generate.mjs (prompt, model, aspect, reference images)
 *   3. shots.html (the shot sheet: copy a prompt into the Higgsfield app by hand)
 *
 * Consistency comes from reuse: the LOOK and SHOE strings are pasted byte-identical
 * into every prompt. Change a word here and every prompt changes with it.
 *
 * Stage 1 makes each shoe's master (a studio side profile, no reference).
 * Stage 2 passes that master as a reference image, so the same shoe appears everywhere.
 *
 * Plain script on purpose: the browser reads window.HOLDFAST_SHOTS, Node reads it through vm.
 */
(function (root) {
  /* ───────────── LOOK BIBLE ───────────── */

  var STUDIO =
    'Photoreal premium footwear product photography, medium-format camera, 100mm lens, f/11, every material texture crisp. ' +
    'One large soft key light from above and slightly camera-left, a crisp soft-edged contact shadow directly under the shoe. ' +
    'Seamless matte paper backdrop and floor in one flat colour. Colour-accurate neutral grade, fine grain.';

  var SHORE =
    'Photoreal cinematic outdoor photography, shot on ARRI Alexa 35, fine film grain, natural colour. ' +
    'A wild cold-water coast: wet black basalt rock with a specular sheen, white surf foam, dark teal-green sea, strands of olive-bronze kelp. ' +
    'Overcast silver sky with one low raking break of sun from the side. ' +
    'Palette: basalt black #0E1110, foam white #EDEFE8, sea teal #12383A, kelp bronze #6B5A2E, one small accent of lichen chartreuse #C9F03C. ' +
    'Crisp and cold. No haze, no bloom, no lens flare.';

  var CITY =
    'Photoreal cinematic night street photography, shot on ARRI Alexa 35 with anamorphic lenses, fine film grain. ' +
    'A city street after heavy rain: black wet asphalt and pale stone paving with mirror reflections of white shop light and amber street lamps, ' +
    'puddles with fine rain ripples. Cool neutral shadows, never crushed to black. No neon colours, no haze, no lens flare.';

  var GRANITE =
    'Photoreal cinematic outdoor photography, shot on ARRI Alexa 35, fine film grain, natural colour. ' +
    'High alpine granite slabs, pale grey rock speckled with black mica and patches of chartreuse map lichen, a thin film of meltwater on the rock. ' +
    'Cold early-morning side light, deep blue sky, crisp air. No haze, no lens flare.';

  var MACRO =
    'Photoreal natural-history macro photography, 100mm macro lens, focus-stacked so the subject is sharp edge to edge, fine grain. ' +
    'Soft raking side light, dark natural background, true-to-life colour.';

  var NEG = 'No text, no letters, no numbers, no logos, no brand marks anywhere on the shoe or in the frame, no watermark.';
  var SAME = 'The shoe is exactly the shoe in the reference image: identical shape, materials, colours and outsole. Do not redesign it.';

  /* ───────────── THE SHOES (described the same way every time) ───────────── */

  var SHOE = {
    kelp:
      'a low-cut coastal trail-running shoe with a basalt-black engineered mesh upper sealed by a thin matte film over the toe and sides, ' +
      'a dark olive-green (#3E4A2C) foam midsole sculpted with deep horizontal ribs, and a black rubber outsole of branching, root-like lugs ' +
      'that curl up and wrap over the toe tip and the back of the heel like the holdfast of a kelp plant; gusseted tongue, ' +
      'lichen-chartreuse (#C9F03C) round laces and heel pull loop',
    gecko:
      'a sleek low-profile city running shoe with a foam-white (#ECEDE6) seamless knit upper, a slate-grey (#5B6366) midsole with a clean straight sidewall, ' +
      'and a thin translucent smoke-grey rubber outsole cut with hundreds of razor-fine parallel micro-grooves that show along its edge like the toe pads of a gecko; ' +
      'white flat laces and one small lichen-chartreuse (#C9F03C) heel tab',
    octo:
      'a slip-on amphibious water shoe with a deep tide-teal (#0F4C4F) quick-drain mesh upper, a row of oval drainage ports along each side of the midsole, ' +
      'a teal bungee lace with a small toggle, and a soft coral-pink (#F28C7A) rubber outsole made of round suction-cup pods, each with a raised rim and a hollow centre, ' +
      'that wrap up around the edge of the shoe like the arm of an octopus',
    limpet:
      'a rugged low approach shoe for scrambling rock with a granite-grey (#8A8A84) suede and ripstop upper, a sticky matte black climbing-rubber rand ' +
      'wrapping the whole toe and heel, lace-to-toe lacing with burnt-orange (#E8772E) laces, and a black outsole with a flat smooth climbing zone under the toe ' +
      'and tight concentric ring lugs under the heel like the shell of a limpet',
  };

  /* What the outsole looks like when seen straight on. */
  var SOLE = {
    kelp: 'The outsole: clusters of thick black rubber lugs that branch from central knots like roots, curling outward, deeper and more open at the heel and toe.',
    gecko: 'The outsole: smoke-grey translucent rubber covered edge to edge in hundreds of fine parallel wavy micro-grooves, like the lamellae on a gecko toe.',
    octo: 'The outsole: coral-pink rubber packed with round suction-cup pods of two sizes, each pod a raised ring with a hollow centre.',
    limpet: 'The outsole: black sticky rubber, perfectly smooth under the toe for smearing on rock, then tight concentric ring lugs centred under the heel.',
  };

  /* Studio backdrop per shoe: the colour-block world of the product shots. */
  var BACKDROP = {
    /* hexes sampled from the generated photos (tools/sample-backdrops.mjs), so letterboxes match them */
    kelp: 'pale sea-fog grey-green (#B9C0BA)',
    gecko: 'deep slate grey (#414749)',
    octo: 'pale coral sand (#E9BAAB)',
    limpet: 'warm bone white (#DDD4C8)',
  };

  /* Where each shoe lives, for its on-foot field shot. */
  var FIELD = {
    kelp:
      SHORE +
      ' Low camera at rock level, 35mm lens, frozen motion at 1/4000 s: a trail runner mid-stride across a wet basalt ledge above the sea, ' +
      'only from the knees down, black running tights, the front foot landing flat on wet rock with water spraying off the sole. Morning, a wave breaking white behind.',
    gecko:
      CITY +
      ' Camera at ankle height on the far kerb, 50mm lens, frozen motion: a runner in black tights crossing a rain-soaked zebra crossing at night, only from the knees down, ' +
      'one foot planted on a wet white painted stripe, a crown of fine splash around the sole, reflections of shop windows stretching across the asphalt.',
    octo:
      SHORE +
      ' Bright overcast midday. Camera low on a wet stone jetty, 35mm lens: a person stepping off a small wooden boat onto slippery green-weed-covered stone, ' +
      'only bare ankles and lower legs visible, one foot planted firmly on the weed, water draining out of the shoe through its side ports.',
    limpet:
      GRANITE +
      ' Camera close to the rock, 28mm lens, looking up the slab: a climber scrambling up a steep wet granite slab, only the lower legs in grey trousers visible, ' +
      'one shoe smearing flat on the bare rock using the smooth toe, the other stepping high, small trickles of meltwater around them.',
  };

  var gpt = function (o, quality) {
    o.model = 'gpt_image_2_6';
    o.params = { resolution: '2k', quality: quality || 'high' };
    return o;
  };
  var soul = function (o) {
    o.model = 'soul_cinematic';
    o.params = { quality: '2k' };
    return o;
  };

  var MODELS = ['kelp', 'gecko', 'octo', 'limpet'];
  var NAMES = { kelp: 'Kelp', gecko: 'Gecko', octo: 'Octo', limpet: 'Limpet' };
  var shots = [];

  /* ───────────── STAGE 1: the four masters ───────────── */
  MODELS.forEach(function (m) {
    shots.push(
      gpt({
        id: m + '-side',
        stage: 1,
        aspect: '4:3',
        tone: 'studio',
        model_of: m,
        used: ['Home: shoe card', 'Shoe page: main image', 'Master reference for every other ' + NAMES[m] + ' image'],
        alt: 'The Holdfast ' + NAMES[m] + ' in side profile.',
        brief: NAMES[m] + ', exact side profile, toe right, on a flat ' + BACKDROP[m].replace(/ \(.*\)/, '') + ' backdrop. This image defines the shoe.',
        prompt:
          STUDIO + ' Backdrop: ' + BACKDROP[m] + '. A single ' + SHOE[m] + '. ' +
          'Exact side profile of the outer side, toe pointing right, sitting flat on the floor, centred, filling about 80% of the frame width, ' +
          'camera at sole height so the edge of the outsole and its wrap are clearly visible. ' + NEG,
      })
    );
  });

  /* Animals that grip, the inspiration for each sole. No product, so the cheap cinematic model. */
  shots.push(
    soul({
      id: 'nature-kelp', stage: 1, aspect: '3:4', tone: 'deep', model_of: 'kelp',
      used: ['Home: Grip Lab', 'Kelp page: how it grips'],
      alt: 'A kelp holdfast clenched around a boulder underwater.',
      brief: 'Underwater: the root-like knot of a giant kelp holdfast clamped to a dark boulder, light shafts from above.',
      prompt:
        'Photoreal underwater natural-history photograph, 28mm lens in an underwater housing, fine grain. The holdfast of a giant kelp: a dense, clenched knot of ' +
        'branching olive-bronze root-like fingers gripping a dark basalt boulder on the sea floor, thick kelp stipes rising out of the top of the frame, ' +
        'cold green-teal water, soft shafts of daylight from above, drifting particles. ' + NEG,
    }),
    soul({
      id: 'nature-gecko', stage: 1, aspect: '3:4', tone: 'deep', model_of: 'gecko',
      used: ['Home: Grip Lab', 'Gecko page: how it grips'],
      alt: 'A gecko’s toe pads pressed flat against wet glass.',
      brief: 'Macro through wet glass: a gecko foot pressed flat, the fine parallel lamellae on each toe pad visible.',
      prompt:
        MACRO + ' Seen through a pane of glass: the underside of a gecko’s foot pressed flat against the wet glass, the five splayed toes showing rows of fine parallel ' +
        'lamellae on each toe pad, small water droplets on the glass around it, the gecko’s pale belly soft in the background. Dark background. ' + NEG,
    }),
    soul({
      id: 'nature-octo', stage: 1, aspect: '3:4', tone: 'deep', model_of: 'octo',
      used: ['Home: Grip Lab', 'Octo page: how it grips'],
      alt: 'An octopus arm gripping wet rock with rows of suction cups.',
      brief: 'Macro: an octopus arm curled over wet black rock, rows of pale suckers gripping, glistening.',
      prompt:
        MACRO + ' An octopus arm curling across wet black rock at the edge of a tidepool, two rows of pale suction cups pressed onto the stone and gripping it, ' +
        'the skin mottled red-brown and glistening, shallow clear water at the edge of the frame. ' + NEG,
    }),
    soul({
      id: 'nature-limpet', stage: 1, aspect: '3:4', tone: 'deep', model_of: 'limpet',
      used: ['Home: Grip Lab', 'Limpet page: how it grips'],
      alt: 'Limpets clamped to wet granite between the tides.',
      brief: 'Macro: ribbed limpet shells clamped to wet grey granite, concentric growth rings, water draining off.',
      prompt:
        MACRO + ' Three common limpets (Patella) clamped flat to wet grey granite in the intertidal zone, seen from slightly above: each shell a wide, low, ' +
        'uncoiled cone like a small pointed hat, with radiating ribs and concentric growth rings, its whole rim sealed tight against the rock. ' +
        'These are limpets, not snails: no spiral, no coiled whorls, no opening visible. A few small barnacles, a thin sheet of seawater draining off the rock around the shells, overcast light. ' + NEG,
    }),
    soul({
      id: 'story-surge', stage: 1, aspect: '3:4', tone: 'deep',
      used: ['Home: 01 The holdfast'],
      alt: 'Kelp pulled flat by a surge underwater, still holding to the rocks.',
      brief: 'Underwater: a surge drags a forest of kelp sideways; every strand still held to the rocks at its base.',
      prompt:
        'Photoreal underwater natural-history photograph, 20mm lens in an underwater housing, fine grain. A strong surge drags a forest of olive-bronze kelp strands ' +
        'sideways across the frame, the long blades streaming flat in the current, while every strand stays locked to the dark rocks at its base by a knotted holdfast. ' +
        'Cold teal water, white churn of a breaking wave at the surface above, light shafts. ' + NEG,
    })
  );

  /* ───────────── STAGE 2: everything that shows a shoe, referenced to its master ───────────── */
  MODELS.forEach(function (m) {
    var ref = ['higgsfield/renders/' + m + '-side.png'];
    shots.push(
      gpt({
        id: m + '-pair', stage: 2, aspect: '4:5', tone: 'studio', model_of: m, refs: ref,
        used: ['Shoe page: gallery'],
        alt: 'A pair of Holdfast ' + NAMES[m] + ', one standing, one on its side showing the sole.',
        brief: 'The pair: one shoe at a three-quarter front angle, the other on its side behind it showing the outsole.',
        prompt:
          STUDIO + ' Backdrop: ' + BACKDROP[m] + '. A pair of shoes: ' + SHOE[m] + '. One shoe stands in three-quarter front view, ' +
          'the second lies on its side just behind it with its outsole facing camera. Camera slightly above, 70mm lens. ' + SAME + ' ' + NEG,
      }),
      gpt({
        id: m + '-sole', stage: 2, aspect: '3:4', tone: 'studio', model_of: m, refs: ref,
        used: ['Shoe page: gallery', 'Home: Grip Lab (beside the drawn tread)'],
        alt: 'The outsole of the Holdfast ' + NAMES[m] + ', seen straight on.',
        brief: 'Top-down on the outsole, shoe upside down, toe at the top, every lug crisp.',
        prompt:
          STUDIO + ' Backdrop: ' + BACKDROP[m] + '. Top-down view looking straight down at the outsole of a single shoe lying upside down, ' +
          'toe at the top of the frame, the whole sole visible and centred with even space around it, every lug and groove crisp. ' +
          SOLE[m] + ' ' + SAME + ' ' + NEG,
      }),
      gpt({
        id: m + '-field', stage: 2, aspect: '3:2', tone: m === 'gecko' ? 'night' : 'deep', model_of: m, refs: ref,
        used: ['Home: 04 In the field', 'Shoe page: gallery'],
        alt: 'The Holdfast ' + NAMES[m] + ' in use.',
        brief: {
          kelp: 'Runner, knees down, landing on a wet basalt ledge above the sea, spray off the sole.',
          gecko: 'Night, rain: a runner’s foot planted on a wet zebra stripe, a crown of splash.',
          octo: 'Stepping off a boat onto weedy wet stone; water draining from the side ports.',
          limpet: 'Scrambling a wet granite slab: one shoe smearing flat on bare rock.',
        }[m],
        prompt: FIELD[m] + ' The shoes: ' + SHOE[m] + '. ' + SAME + ' ' + NEG,
      })
    );
  });

  var kelpRef = ['higgsfield/renders/kelp-side.png'];
  shots.push(
    gpt({
      id: 'hero', stage: 2, aspect: '16:9', tone: 'deep', model_of: 'kelp', refs: kelpRef, priority: true,
      used: ['Home: hero (desktop)', 'Social card'],
      alt: 'A runner’s shoe planted on wet black rock as a wave explodes behind it.',
      brief: 'One shoe planted on a wet basalt ledge, right third; a wave explodes behind; left half dark sea for the headline.',
      prompt:
        SHORE + ' Low camera at rock level, 35mm lens, frozen motion at 1/4000 s: a trail runner’s right foot in ' + SHOE.kelp + ', ' +
        'planted on a wet black basalt ledge in the right third of the frame, the lower leg in black running tights visible to mid-calf. ' +
        'A wave explodes against the rock behind, white spray frozen in mid-air, sheets of water streaming across the ledge and around the sole. ' +
        'The shoe is perfectly sharp and does not move. The left half of the frame is darker calm sea under an overcast sky: open, quiet negative space. ' +
        SAME + ' ' + NEG,
    }),
    gpt({
      id: 'hero-m', stage: 2, aspect: '9:16', tone: 'deep', model_of: 'kelp', refs: kelpRef, priority: true,
      used: ['Home: hero (phones)'],
      alt: 'A runner’s shoe planted on wet black rock as a wave explodes behind it.',
      brief: 'Portrait hero: the planted shoe and the exploding wave in the upper half; the lower third dark wet rock for the headline.',
      prompt:
        SHORE + ' Low camera at rock level, 35mm lens, frozen motion at 1/4000 s, vertical frame: a trail runner’s right foot in ' + SHOE.kelp + ', ' +
        'planted on a wet black basalt ledge in the upper-middle of the frame, a wave exploding into white spray behind and above it. ' +
        'The lower third of the frame is dark wet rock in shadow: quiet negative space. ' + SAME + ' ' + NEG,
    }),
    gpt({
      id: 'closing', stage: 2, aspect: '21:9', tone: 'deep', model_of: 'kelp', refs: kelpRef,
      used: ['Home: closing band'],
      alt: 'A pair of shoes on a wet rock ledge above the sea at dusk.',
      brief: 'Dusk: a pair of Kelps side by side on a wet ledge above the sea, right side; left 40% empty dusk sky.',
      prompt:
        SHORE + ' Dusk, the last low light raking across the rock. Wide 35mm frame: a pair of ' + SHOE.kelp + ' standing side by side on a wet basalt ledge high above the sea, ' +
        'in the right third of the frame, a thin line of foam far below. The left 40% of the frame is empty, darkening dusk sky over the sea. ' + SAME + ' ' + NEG,
    })
  );

  /* ───────────── STAGE 3: end frames for the films (they reference stage 2 images) ───────────── */
  var MACRO_ROCK =
    'Photoreal macro product cinematography, 100mm macro lens at rock level, shot on ARRI Alexa 35, fine grain. ' +
    'Wet black basalt covered by a thin moving film of seawater, one hard raking side light that makes every droplet and wet edge sparkle, ' +
    'deep dark background. Palette: basalt black #0E1110, foam white #EDEFE8, one accent of lichen chartreuse #C9F03C. No haze, no lens flare.';
  var kelpSoleRefs = ['higgsfield/renders/kelp-sole.png', 'higgsfield/renders/kelp-side.png'];
  shots.push(
    gpt({
      id: 'hero-end', stage: 3, aspect: '16:9', tone: 'deep', model_of: 'kelp', refs: ['higgsfield/renders/hero.png', 'higgsfield/renders/kelp-side.png'],
      used: ['Home: last frame of the hero film', 'Hero crossfade until the film exists'],
      alt: 'Water draining off the rock around the planted shoe after the wave.',
      brief: 'Two seconds later, same framing: the wave has passed, white water drains around the planted shoe. It has not moved.',
      prompt:
        'The same frame as the first reference image, two seconds later. Same camera position, lens, framing, light and colour. ' +
        'The wave has passed: sheets of white water drain off the basalt ledge and stream around the sole, a little spray still hangs in the air, the sea behind is calmer. ' +
        'The runner’s shoe is in exactly the same place on the rock, unmoved. The shoe matches the second reference image exactly. ' + NEG,
    }),
    /* the phone film's end frame, made from the phone hero so both ends share one vertical camera */
    gpt({
      id: 'hero-m-end', stage: 3, aspect: '9:16', tone: 'deep', model_of: 'kelp', refs: ['higgsfield/renders/hero-m.png', 'higgsfield/renders/kelp-side.png'],
      used: ['Home: last frame of the phone hero film'],
      alt: 'Water draining off the rock around the planted shoe after the wave.',
      brief: 'The phone hero two seconds later, same vertical framing: the wave has passed, white water drains around the planted shoe.',
      prompt:
        'The same frame as the first reference image, two seconds later. Same vertical frame, camera position, lens, framing, light and colour. ' +
        'The wave has passed: sheets of white water drain off the basalt ledge and stream around the sole, a little spray still hangs in the air, the sea behind is calmer. ' +
        'The runner’s shoe and leg are in exactly the same place, unmoved, facing the same way. The lower third stays dark wet rock in shadow. ' +
        'The shoe matches the second reference image exactly. ' + NEG,
    }),
    gpt({
      id: 'press-start', stage: 3, aspect: '16:9', tone: 'deep', model_of: 'kelp', refs: kelpSoleRefs,
      used: ['Home: first frame of the press film', 'Press crossfade until the film exists'],
      alt: 'A shoe hovering just above wet rock, water dripping from its lugs.',
      brief: 'Macro, side-on at rock level: the Kelp a finger’s width above wet basalt, its lugs edge-on, drops falling. Left 40% dark.',
      prompt:
        MACRO_ROCK + ' Side-on at rock level: a runner’s foot in ' + SHOE.kelp + ' hovering a finger’s width above the wet rock, about to land, ' +
        'the branching lugs of the outsole seen edge-on, drops of water falling from them. Only the shoe and ankle in frame, in the right 60% of the frame; ' +
        'the left 40% is dark, quiet negative space. The outsole matches the first reference image, the shoe matches the second. ' + NEG,
    }),
    /* stage 4: made FROM press-start, so the film's two ends share one camera (a separate prompt flipped the shoe) */
    gpt({
      id: 'press-end', stage: 4, aspect: '16:9', tone: 'deep', model_of: 'kelp', refs: ['higgsfield/renders/press-start.png', 'higgsfield/renders/kelp-sole.png'],
      used: ['Home: last frame of the press film'],
      alt: 'The shoe planted on wet rock, a crown of water squeezed out from under the sole.',
      brief: 'The press-start frame a moment later: the shoe has come straight down and is planted flat, water squeezed out sideways.',
      prompt:
        'The same frame as the first reference image, a fraction of a second later. Same camera position, lens, framing, light and colour; ' +
        'the shoe faces exactly the same direction and sits in exactly the same place left to right. It has come straight down and is now planted flat on the wet rock, ' +
        'the lugs pressed through the water film, a low crown of fine spray and a ring of water squeezed out sideways from under the sole, frozen. ' +
        'The outsole matches the second reference image. ' + NEG,
    })
  );

  /* ───────────── STAGE 3: 3D models of each shoe, from its master ───────────── */
  var models3d = MODELS.map(function (m) {
    return {
      id: '3d-' + m, kind: 'model3d', stage: 3, model: 'tripo_h3_1_image_to_3d', model_of: m,
      params: { texture: true, pbr: true, orientation: 'align_image' },
      refs: ['higgsfield/renders/' + m + '-side.png'], aspect: '3D',
      used: ['Shoe page: 3D view (replaces the drawn 3D shoe)'],
      alt: 'A 3D model of the Holdfast ' + NAMES[m] + '.',
      brief: 'Textured 3D model of the ' + NAMES[m] + ', made from its side master. Saved to assets/3d/' + m + '.glb.',
      prompt: '(no prompt: image to 3D from ' + m + '-side)',
    };
  });

  /* ───────────── STAGE 4: the scroll films (start and end frames are stills above) ───────────── */
  var films = [
    {
      id: 'film-hero', kind: 'film', stage: 5, model: 'kling4_0', aspect: '16:9', name: 'hero',
      params: { mode: 'image-to-video', duration: 10, resolution: '1080p' },
      start: 'hero', end: 'hero-end', model_of: 'kelp', focus: 0.85,
      used: ['Home: hero, scrubbed by scrolling'],
      alt: 'A wave explodes over a runner’s planted shoe; the water drains away and the shoe has not moved.',
      brief: 'One locked shot, 10 s: the wave hits the planted shoe, floods the ledge, drains away. The shoe never moves.',
      beats: [
        { at: 0, text: 'Low over wet basalt. The shoe is planted.' },
        { at: 0.3, text: 'The wave rises behind it and hits.' },
        { at: 0.55, text: 'White water floods across the ledge.' },
        { at: 0.8, text: 'It drains away. The shoe has not moved.' },
      ],
      prompt:
        'One continuous shot, no cuts. Locked-off camera at rock level with a very slow push-in toward the planted shoe. A wave rises behind the ledge, ' +
        'explodes against the rock in white spray, floods across the ledge around the shoe and drains away. The shoe and the runner’s leg stay perfectly still and sharp the whole time. ' +
        'Slightly slowed, natural motion, crisp detail, constant exposure. No text, no logos.',
    },
    /* The same moment shot vertically for phones: the landscape film can't fit the shoe in a tall crop.
       film.js plays it instead of 'hero' on portrait phones (phoneOf). */
    {
      id: 'film-hero-m', kind: 'film', stage: 5, model: 'kling4_0', aspect: '9:16', name: 'hero-m', phoneOf: 'hero',
      params: { mode: 'image-to-video', duration: 10, resolution: '1080p' },
      start: 'hero-m', end: 'hero-m-end', model_of: 'kelp', focus: 0.5, grade: 1.15,
      used: ['Home: hero on phones, scrubbed by scrolling'],
      alt: 'A wave explodes over a runner’s planted shoe; the water drains away and the shoe has not moved.',
      brief: 'The hero film shot vertically, 10 s: the wave hits the planted shoe, floods the ledge, drains away. Shoe in the upper half.',
      beats: [
        { at: 0, text: 'Low over wet basalt. The shoe is planted.' },
        { at: 0.3, text: 'The wave rises behind it and hits.' },
        { at: 0.55, text: 'White water floods across the ledge.' },
        { at: 0.8, text: 'It drains away. The shoe has not moved.' },
      ],
      prompt:
        'One continuous vertical shot, no cuts. Locked-off camera at rock level with a very slow push-in toward the planted shoe in the upper half of the frame. ' +
        'A wave rises behind the ledge, explodes against the rock in white spray, floods across the ledge around the shoe and drains away. ' +
        'The shoe and the runner’s leg stay perfectly still and sharp the whole time; the lower third stays dark wet rock. ' +
        'Slightly slowed, natural motion, crisp detail, constant exposure. No text, no logos.',
    },
    {
      id: 'film-press', kind: 'film', stage: 5, model: 'kling4_0', aspect: '16:9', name: 'press',
      params: { mode: 'image-to-video', duration: 5, resolution: '1080p' },
      start: 'press-start', end: 'press-end', model_of: 'kelp', focus: 0.8, grade: 1.35,
      used: ['Home: 02 Watch it hold, scrubbed by scrolling'],
      alt: 'In macro, a shoe lands on wet rock and squeezes the water out from under its lugs.',
      brief: 'Macro, 5 s: the shoe lands on wet rock; water is squeezed out sideways from under the lugs.',
      beats: [
        { at: 0, text: 'A finger’s width above wet rock.' },
        { at: 0.35, text: 'Weight lands.' },
        { at: 0.6, text: 'The lugs push the water out.' },
        { at: 0.85, text: 'Rubber on rock.' },
      ],
      prompt:
        'One continuous macro shot, no cuts, locked-off camera at rock level. The shoe comes down and plants flat on the wet rock; ' +
        'the thin film of water is squeezed out sideways from under the lugs in a low crown of fine spray. Slow motion, crisp, constant exposure. No text, no logos.',
    },
  ];

  var all = shots.concat(models3d, films);
  root.HOLDFAST_SHOTS = {
    look: { STUDIO: STUDIO, SHORE: SHORE, CITY: CITY, GRANITE: GRANITE, MACRO: MACRO, MACRO_ROCK: MACRO_ROCK, NEG: NEG, SAME: SAME },
    shoe: SHOE,
    shots: shots,
    models3d: models3d,
    films: films,
    all: all,
    byId: all.reduce(function (a, s) { a[s.id] = s; return a; }, {}),
  };
})(typeof window !== 'undefined' ? window : globalThis);
