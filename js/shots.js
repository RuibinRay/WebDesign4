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

  /* ───────────── THE SPORT LINE: six more shoes, same pipeline ───────────── */

  var SPORTLOOK = 'Photoreal cinematic sports photography, shot on ARRI Alexa 35, fine film grain, natural colour. ';
  var ROAD =
    SPORTLOOK + 'An empty multi-lane highway at blue dawn just after rain: black wet asphalt with mirror reflections of the sky and white lane lines, ' +
    'a thin warm strip of sunrise on the horizon, cool blue light everywhere else. No haze, no lens flare.';
  var STREETCOURT =
    SPORTLOOK + 'An outdoor street basketball court just after a summer storm: dark painted asphalt with crisp white court lines and shallow puddles reflecting a violet dusk sky, ' +
    'a chain-link fence, floodlights just switching on. No haze, no lens flare.';
  var PITCH =
    SPORTLOOK + 'A football pitch at night in driving rain: high floodlights backlighting the rain streaks, deep green wet grass glistening, spray in the air, dark empty stands. No lens flare.';
  var RIDGE =
    SPORTLOOK + 'A high mountain ridge in cloud and drizzle: dark wet rock steps patched with grey-green lichen, mist drifting past, cold soft light. No lens flare.';
  var FOREST =
    SPORTLOOK + 'A steep mountain forest trail in the rain: dark wet mud, slick roots, moss and ferns, soft green light under the canopy. No haze, no lens flare.';
  var CLAY =
    SPORTLOOK + 'An outdoor clay tennis court just after a short rain shower: damp terracotta clay with crisp white lines, low warm late-afternoon sun raking across it. No lens flare.';

  SHOE.cheetah =
    'a futuristic carbon-plated road racing shoe with a translucent sun-gold (#E8B53A) engineered mono-mesh upper printed with a faint darker-gold rosette pattern that fades out toward the heel, ' +
    'a towering sculpted chalk-white (#F1EEE6) foam midsole with an aggressive rocker toe, a glossy black carbon-fibre plate showing as a thin stripe along the midsole sidewall, ' +
    'a black rubber outsole of small raked claw-shaped pods under the forefoot, thin black laces and a black heel tab';
  SHOE.frog =
    'a bold high-top basketball shoe with an electric leaf-green (#6FD13B) knit upper, glossy cobalt-blue (#1F4FE0) moulded side panels, ' +
    'a padded high collar with a wide flare-orange (#F2542D) ankle strap across the front, a chunky cobalt-blue foam midsole with a lateral outrigger, ' +
    'and a flare-orange translucent rubber outsole made of hexagonal pads separated by deep channels, like a tree frog’s toe pad; orange laces';
  SHOE.mako =
    'a sleek laceless firm-ground football boot (soccer cleat) with a seamless upper that fades from deep metallic abyss-blue (#1C2A4A) on top to bright belly-white (#EEF1F2) toward the sole, ' +
    'like a shark’s countershading, the whole upper covered in a fine raised texture of tiny ribbed tooth-shaped scales like shark skin, a low knit sock collar, ' +
    'a thin pale ice-grey (#C9D3DB) soleplate with sharp blade studs shaped like shark teeth, and one thin bite-red (#E63B2E) slash along the heel';
  SHOE.ibex =
    'a rugged modern mid-cut hiking boot with a bone-white (#E9E4D8) ripstop and nubuck upper wrapped by a matte black cage, a padded collar, ' +
    'rust-orange (#C4501E) metal lace hooks and rust laces, a black rubber rand around the toe, a coal-black (#1A1A18) midsole, ' +
    'and a black outsole with a rim of chunky block lugs around a smoother, softer centre pad, like the hoof of a mountain goat';
  SHOE.beetle =
    'an aggressive mountain trail racing shoe with a coal-black ripstop upper overlaid with an iridescent film that shifts from emerald green (#1E9E6E) to violet (#6D4BC9) with the angle of the light, ' +
    'like a tiger beetle’s shell, a stretch-knit gaiter collar, a bright emerald foam midsole, violet laces, and a black outsole of deep hooked claw-shaped lugs';
  SHOE.spider =
    'a clean premium tennis and padel shoe with a chalk-white (#F2F1EC) leather and mesh upper overlaid with fine black web-like lines radiating from the forefoot, ' +
    'a white cupsole midsole with a lateral outrigger, black laces, a small black heel tab, and a clay-red (#D4572F) rubber outsole patterned like a spider web';

  SOLE.cheetah = 'The outsole: black rubber with rows of small raked claw-shaped chevron pods under the forefoot, an open window under the arch showing a glossy black carbon plate, and curved ridged pads under the heel.';
  SOLE.frog = 'The outsole: flare-orange translucent rubber covered edge to edge in hexagonal pads separated by deep channels, like a tree frog’s toe pad, with a round concentric pivot pad under the ball of the foot.';
  SOLE.mako = 'The soleplate: pale ice-grey with sharp blade studs shaped like shark teeth around the forefoot and the heel, two round studs down the centre of the forefoot, and a ribbed spine along the arch.';
  SOLE.ibex = 'The outsole: black rubber with a raised rim of chunky block lugs all round the edge, a smoother, softer centre pad of concentric ovals under the forefoot and the heel, a split at the toe and a deep chevron brake lug at the back of the heel.';
  SOLE.beetle = 'The outsole: black rubber covered in deep hooked lugs shaped like small claws, curled back under the forefoot and forward under the heel, with open channels between them.';
  SOLE.spider = 'The outsole: clay-red rubber patterned like a spider web, spokes and rings radiating from a round pivot under the ball of the foot and another under the heel, with a herringbone band under the arch.';

  /* the backdrop of each sport shoe is its stage colour on the home page (stage in js/data.js) */
  BACKDROP.cheetah = 'deep night blue (#1B2238)';
  BACKDROP.frog = 'deep aubergine (#2A1E33)';
  BACKDROP.mako = 'pale ice grey (#D5DDE0)';
  BACKDROP.ibex = 'deep moss green (#2F3B2A)';
  BACKDROP.beetle = 'pale lilac grey (#C8C0D6)';
  BACKDROP.spider = 'deep court green (#1F4A3A)';

  FIELD.cheetah =
    ROAD + ' Camera at asphalt level, 35mm lens, frozen motion at 1/4000 s: a road runner mid-stride down the wet empty highway, only from the knees down, black running tights, ' +
    'the back foot toeing off with a fan of fine spray flicking off the outsole, a white lane line beside it.';
  FIELD.frog =
    STREETCOURT + ' Low camera at court level, 24mm lens, frozen motion: a basketball player in black shorts and white crew socks making a hard crossover cut, only from the knees down, ' +
    'one high-top shoe planted at a sharp angle on a wet court line, droplets flying off the sole, a plain orange basketball bouncing just out of focus.';
  FIELD.mako =
    PITCH + ' Low camera at grass level, 35mm lens, frozen motion: a footballer in black socks striking a plain white ball with the instep, only from the knees down, ' +
    'spray exploding off the ball and the wet grass, the planted boot’s studs biting into the turf.';
  FIELD.ibex =
    RIDGE + ' Camera low on the rock, 28mm lens: a hiker stepping up a steep wet rock step on the ridge, only from the knees down, grey hiking trousers, ' +
    'one boot planted on the edge of the rock with its rim lugs biting, the other pushing off, cloud drifting past behind.';
  FIELD.beetle =
    FOREST + ' Low camera at trail level, 24mm lens, frozen motion: a trail runner bombing down a steep muddy descent between wet roots, only from the knees down, black shorts and calf sleeves, ' +
    'the heel landing and its hooked lugs braking into the mud, flecks of mud flying.';
  FIELD.spider =
    CLAY + ' Camera low at the baseline, 35mm lens, frozen motion: a tennis player sliding wide into a forehand on the damp clay, only from the knees down, white socks, ' +
    'the leading shoe sliding sideways and throwing up a low wave of red clay, the white line crisp beside it.';

  var SPORT = ['cheetah', 'frog', 'mako', 'ibex', 'beetle', 'spider'];
  NAMES.cheetah = 'Cheetah'; NAMES.frog = 'Frog'; NAMES.mako = 'Mako'; NAMES.ibex = 'Ibex'; NAMES.beetle = 'Beetle'; NAMES.spider = 'Spider';
  var FIELD_BRIEF = {
    cheetah: 'Dawn, wet empty highway: a runner toes off, a fan of spray off the claw pods.',
    frog: 'Street court after a storm: a hard crossover cut, the high-top planted on a wet line.',
    mako: 'Floodlit pitch, driving rain: a strike, spray off the ball, studs biting the turf.',
    ibex: 'Ridge in cloud: a boot planted on the edge of a wet rock step.',
    beetle: 'Muddy forest descent: the heel lands and its hooked lugs brake into the mud.',
    spider: 'Damp clay court: a wide sliding forehand throws up a low wave of clay.',
  };

  /* their animals: no product, so the cheap cinematic model */
  var SPORT_NATURE = {
    cheetah: {
      alt: 'A cheetah at full sprint, its claws dug into the dust.',
      brief: 'Telephoto, frozen sprint: a cheetah’s front paw strikes the ground, claws out and dug in, a burst of dust.',
      prompt:
        'Photoreal wildlife photography, 600mm telephoto lens, frozen motion at 1/8000 s, fine grain. A cheetah at full sprint across dry savanna, low angle, ' +
        'its front paw striking the ground with the claws extended and dug into the dust, a small burst of dust from the pad, golden grass blurred behind, warm low sun. ',
    },
    frog: {
      alt: 'A tree frog clinging upside down to a wet leaf by its toe pads.',
      brief: 'Macro: a red-eyed tree frog upside down under a wet leaf, its round orange toe pads pressed flat.',
      prompt: MACRO + ' A red-eyed tree frog clinging upside down to the underside of a wet green leaf, its big round orange toe pads spread and pressed flat against the leaf, beads of water around them, dark rainforest behind. ',
    },
    mako: {
      alt: 'Shark skin up close: thousands of tiny ribbed scales like teeth.',
      brief: 'Extreme macro: wet blue shark skin, thousands of tiny ribbed tooth-shaped scales all pointing one way.',
      prompt: MACRO + ' Extreme close-up of the wet skin of a mako shark, deep metallic blue: thousands of tiny overlapping ribbed tooth-shaped scales (dermal denticles), all pointing the same way, catching a raking light like fine armour. ',
    },
    ibex: {
      alt: 'An ibex on a cliff ledge no wider than its hooves.',
      brief: 'Telephoto: an Alpine ibex on a sheer cliff ledge, close on its split hooves gripping the edge.',
      prompt:
        'Photoreal wildlife photography, 400mm lens, fine grain. An Alpine ibex standing on a sheer cliff ledge no wider than its hooves, framed close on its legs and split hooves gripping the rock edge, ' +
        'the drop falling away below, misty mountains behind, cold morning light. ',
    },
    beetle: {
      alt: 'A tiger beetle on wet sand, its hooked claws dug in.',
      brief: 'Macro at sand level: a metallic green tiger beetle braced on wet sand, its hooked claws dug in.',
      prompt: MACRO + ' A metallic tiger beetle on wet sand, seen low at sand level, its long thin legs braced and the curved hooked claws on its feet digging into the sand grains, its shell iridescent emerald shifting to violet. ',
    },
    spider: {
      alt: 'A jumping spider’s feet pressed flat on glass, seen from below.',
      brief: 'Macro through glass: a jumping spider seen from below, the hair pads under its feet pressed flat.',
      prompt: MACRO + ' A jumping spider walking on a pane of glass, seen from below through the glass: the dense tufts of fine hairs under each foot pressed flat against the glass, its large front eyes visible, dark background. ',
    },
  };

  /* stage 1: masters and animals */
  SPORT.forEach(function (m) {
    shots.push(
      gpt({
        id: m + '-side', stage: 1, aspect: '4:3', tone: 'studio', model_of: m,
        used: ['Home: Sport card', 'Shoe page: main image', 'Master reference for every other ' + NAMES[m] + ' image'],
        alt: 'The Holdfast ' + NAMES[m] + ' in side profile.',
        brief: NAMES[m] + ', exact side profile, toe right, on a flat ' + BACKDROP[m].replace(/ \(.*\)/, '') + ' backdrop. This image defines the shoe.',
        prompt:
          STUDIO + ' Backdrop: ' + BACKDROP[m] + '. A single ' + SHOE[m] + '. ' +
          'Exact side profile of the outer side, toe pointing right, sitting flat on the floor, centred, filling about 80% of the frame width, ' +
          'camera at sole height so the midsole and the outsole edge are clearly visible. ' + NEG,
      }),
      soul({
        id: 'nature-' + m, stage: 1, aspect: '3:4', tone: 'deep', model_of: m,
        used: [NAMES[m] + ' page: how it grips'],
        alt: SPORT_NATURE[m].alt, brief: SPORT_NATURE[m].brief, prompt: SPORT_NATURE[m].prompt + NEG,
      })
    );
  });

  /* stage 2: pair, sole, field from each master */
  SPORT.forEach(function (m) {
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
        used: ['Shoe page: gallery'],
        alt: 'The outsole of the Holdfast ' + NAMES[m] + ', seen straight on.',
        brief: 'Top-down on the outsole, shoe upside down, toe at the top, every lug crisp.',
        prompt:
          STUDIO + ' Backdrop: ' + BACKDROP[m] + '. Top-down view looking straight down at the outsole of a single shoe lying upside down, ' +
          'toe at the top of the frame, the whole sole visible and centred with even space around it, every lug and groove crisp. ' +
          SOLE[m] + ' ' + SAME + ' ' + NEG,
      }),
      gpt({
        id: m + '-field', stage: 2, aspect: '3:2', tone: m === 'mako' || m === 'frog' ? 'night' : 'deep', model_of: m, refs: ref,
        used: ['Home: 06 In the field', 'Shoe page: gallery'],
        alt: 'The Holdfast ' + NAMES[m] + ' in use.',
        brief: FIELD_BRIEF[m],
        prompt: FIELD[m] + ' The shoes: ' + SHOE[m] + '. ' + SAME + ' ' + NEG,
      })
    );
  });

  /* stage 2: the six together, for the top of the sport cards */
  shots.push(
    gpt({
      id: 'sport-lineup', stage: 2, aspect: '21:9', tone: 'studio', refs: SPORT.map(function (m) { return 'higgsfield/renders/' + m + '-side.png'; }),
      used: ['Home: the Sport line banner'],
      alt: 'The six Holdfast sport shoes in a row: road racer, basketball high-top, football boot, hiking boot, trail racer and tennis shoe.',
      brief: 'All six sport shoes in one row, side profiles, toes right, on one seamless dark backdrop, each lit like a trophy.',
      prompt:
        STUDIO + ' Backdrop: seamless basalt black (#0E1110), a soft pool of light under each shoe. Six different sport shoes standing in one evenly spaced row, ' +
        'each in exact side profile with its toe pointing right, in this order from left to right, each one exactly as in the matching reference image: ' +
        'the gold carbon-plated road racer, the green and cobalt basketball high-top, the blue-to-white bladed football boot, the white and rust mid hiking boot, ' +
        'the black and emerald trail racer, the white tennis shoe with the clay-red sole. Wide 35mm frame, camera at sole height. Do not redesign any shoe. ' + NEG,
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
  var models3d = MODELS.concat(SPORT).map(function (m) {
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

  /* ───────────── STAGE 5: Grip Lab films. Each animal's nature shot comes alive, played by scroll.
     Start frame only (no end frame): the motion is small and stays on the subject. 'auto' keeps the 3:4 shape. ───────────── */
  var LAB = {
    kelp:
      'Locked-off underwater camera, no cuts. A strong surge of water sweeps across the frame: the kelp stipes bend and stream sideways, ' +
      'drifting particles rush past, light shafts flicker. The holdfast stays clamped to the boulder, its root-like fingers tightening their grip. Slow, natural motion.',
    gecko:
      'Locked-off macro camera through the glass, no cuts. The gecko presses its foot down onto the wet glass: the toes spread, ' +
      'the fine lamellae on each toe pad flatten against the glass and squeeze the water droplets aside, then hold. Slow, natural motion.',
    octo:
      'Locked-off macro camera, no cuts. The octopus arm curls slowly across the wet black rock; one after another its suckers press down onto the stone, ' +
      'their rims flattening and sealing as they grip. Glistening, slow, natural motion.',
    limpet:
      'Locked-off macro camera, no cuts. A wash of seawater pours over the limpets clamped to the wet granite, foaming around the shells and draining off the rock. ' +
      'The limpets do not move at all. Slow, natural motion.',
  };
  MODELS.forEach(function (m) {
    films.push({
      id: 'film-lab-' + m, kind: 'film', stage: 5, model: 'kling4_0', aspect: 'auto', frame: '3:4', portrait: true, name: 'lab-' + m, lab: m,
      params: { mode: 'image-to-video', duration: 5, resolution: '1080p' },
      start: 'nature-' + m, model_of: m, focus: 0.5,
      used: ['Home: 04 Grip Lab, played by scrolling'],
      alt: shots.filter(function (s) { return s.id === 'nature-' + m; })[0].alt,
      brief: 'The ' + NAMES[m] + ' nature shot comes alive, 5 s: ' + LAB[m].split('. ')[1].toLowerCase(),
      beats: [{ at: 0, text: 'How the ' + NAMES[m].toLowerCase() + ' holds' }],
      prompt: LAB[m] + ' No text, no logos.',
    });
  });

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
