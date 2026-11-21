/*
 * HOLDFAST: the range, as data. The home page cards, the Grip Lab and every
 * shoe page (shoe.html?m=<id>) read from here.
 *
 * CONCEPT VALUES: prices, weights, friction figures and grip ratings are
 * proposals for the concept, not measurements. Replace them with lab results
 * before anything is sold. They are listed again in the README.
 */
(function (root) {
  root.HOLDFAST = {
    models: [
      {
        id: 'kelp',
        name: 'Kelp',
        kind: 'Coastal trail runner',
        learned: 'the kelp holdfast',
        terrain: 'Wet rock · sand · salt spray',
        price: 165,
        color: 'Basalt / Lichen',
        swatch: ['#15191A', '#3E4A2C', '#C9F03C'],
        accent: '#C9F03C',
        line: 'Lugs that branch like roots and wrap over the toe, so the edge of the shoe grips too.',
        how: {
          animal:
            'Kelp has no roots. It holds the sea floor with a holdfast: a knot of branching fingers that grows into every crack of the rock and spreads the pull of each wave across hundreds of contact points.',
          sole:
            'The Kelp outsole copies the branching. Lug clusters grow from central knots and curl outward, so no single edge takes the load, and they climb over the toe and heel where a foot rolls onto wet rock.',
        },
        specs: { weight: '285 g', drop: '6 mm', stack: '30 / 24 mm', lug: '5 mm', rubber: 'HF Wet Grip 1' },
        grip: { 'Wet rock': 5, 'Wet pavement': 4, Mud: 3, Sand: 4 },
        mu: 0.81,
        mat: { upper: '#1a1f1d', mid: '#3E4A2C', sole: '#0b0c0c', accent: '#C9F03C', wire: '#C9F03C' },
      },
      {
        id: 'gecko',
        name: 'Gecko',
        kind: 'Wet-city runner',
        learned: 'the gecko toe',
        terrain: 'Wet pavement · tile · steel',
        price: 140,
        color: 'Foam / Slate',
        swatch: ['#ECEDE6', '#5B6366', '#C9F03C'],
        accent: '#ECEDE6',
        line: 'Hundreds of razor-thin sipes that squeegee water away and put rubber back on the ground.',
        how: {
          animal:
            'A gecko toe is lined with lamellae: fine folds carrying millions of tiny hairs. The folds bend flat against the surface and peel off cleanly, which is how it runs up wet glass.',
          sole:
            'The Gecko outsole is cut with hundreds of parallel micro-sipes. Each one flexes open, pushes the water film aside and closes again, so painted lines, tiles and grates feel dry underfoot.',
        },
        specs: { weight: '240 g', drop: '8 mm', stack: '32 / 24 mm', lug: '1.5 mm', rubber: 'HF Lamella' },
        grip: { 'Wet rock': 3, 'Wet pavement': 5, Mud: 2, Sand: 2 },
        mu: 0.74,
        mat: { upper: '#E6E8E0', mid: '#5B6366', sole: '#4a5052', soleOpacity: 0.92, accent: '#C9F03C', wire: '#8f9893' },
      },
      {
        id: 'octo',
        name: 'Octo',
        kind: 'Amphibious water shoe',
        learned: 'the octopus sucker',
        terrain: 'Decks · weed · tidepools',
        price: 120,
        color: 'Tide / Coral',
        swatch: ['#0F4C4F', '#F28C7A', '#EDEFE8'],
        accent: '#F28C7A',
        line: 'Soft suction pods that press water out and hold to slick, weedy surfaces.',
        how: {
          animal:
            'An octopus sucker is a rim and a cup. The rim seals, the cup flexes and pushes water out, and the pressure difference holds it to rock that nothing else can stand on.',
          sole:
            'The Octo outsole is packed with soft pods in two sizes. Under load each one flattens and squeezes water out of its centre; drainage ports empty the shoe so it never turns into a bucket.',
        },
        specs: { weight: '210 g', drop: '2 mm', stack: '18 / 16 mm', lug: '3 mm', rubber: 'HF Soft Pod' },
        grip: { 'Wet rock': 4, 'Wet pavement': 3, Mud: 2, Sand: 3 },
        mu: 0.77,
        mat: { upper: '#0F4C4F', mid: '#0b3a3c', sole: '#F28C7A', accent: '#F28C7A', wire: '#5fb3b0' },
      },
      {
        id: 'limpet',
        name: 'Limpet',
        kind: 'Approach shoe',
        learned: 'the limpet shell',
        terrain: 'Granite · slab · scree',
        price: 180,
        color: 'Granite / Ember',
        swatch: ['#8A8A84', '#1B1C1B', '#E8772E'],
        accent: '#E8772E',
        line: 'A smooth climbing-rubber toe for smearing, concentric rings under the heel for the walk down.',
        how: {
          animal:
            'A limpet clamps to rock so hard that surf cannot shift it. Its shell grows to the exact shape of its home scar, and its muscular foot uses suction and sticky mucus to stay put.',
          sole:
            'The Limpet puts the stickiest rubber we have in a smooth zone under the toe, so the whole forefoot can smear flat on slab, then switches to concentric heel rings that bite on the descent.',
        },
        specs: { weight: '370 g', drop: '4 mm', stack: '22 / 18 mm', lug: '4 mm', rubber: 'HF Friction Max' },
        grip: { 'Wet rock': 5, 'Wet pavement': 3, Mud: 3, Sand: 3 },
        mu: 0.86,
        mat: { upper: '#8A8A84', mid: '#1B1C1B', sole: '#111211', accent: '#E8772E', wire: '#c9c9c2' },
      },

      /* ───── THE SPORT LINE: six sports, six animals that grip at speed.
         sport / word: the label and the giant word on the home page's sport stage.
         stage / ink: that stage's colour and its text colour (the studio backdrop of its photos).
         form: how the drawn 3D shoe is built (js/src/shoe3d.src.js): toe spring, midsole ribs,
         carbon plate, ankle height (0 low, 1 high-top), lace count, ankle strap, studs. ───── */
      {
        id: 'cheetah', range: 'sport', sport: 'Running', word: 'RUN',
        name: 'Cheetah',
        kind: 'Road racer',
        learned: 'the cheetah claw',
        terrain: 'Road · track · wet tarmac',
        price: 250,
        color: 'Sun Gold / Night',
        swatch: ['#E8B53A', '#141414', '#F1EEE6'],
        accent: '#E8B53A',
        stage: '#1B2238', ink: 'light',
        line: 'Claw pods under the forefoot that bite like spikes at toe-off, on a full-length carbon plate.',
        how: {
          animal:
            'A cheetah never fully pulls its claws in. At a sprint they dig into the ground like running spikes, while hard, ridged paw pads steer and brake. It is the only cat built that way, because it is the only cat that sprints for a living.',
          sole:
            'The Cheetah puts raked claw pods under the forefoot, angled so they bite as you toe off and let go as you land. A carbon plate runs the full length and shows through the open midfoot, and the heel carries ridged pads that hold a wet corner.',
        },
        specs: { weight: '198 g', drop: '8 mm', stack: '39 / 31 mm', lug: '2.5 mm claw pods', plate: 'Full-length carbon', rubber: 'HF Claw' },
        grip: { 'Wet road': 5, 'Dry road': 5, Track: 4, Gravel: 2 },
        mu: 0.79, muLabel: 'Wet-asphalt friction',
        mat: { upper: '#E8B53A', mid: '#F1EEE6', sole: '#151515', accent: '#141414', wire: '#7a5a12', plate: '#121212' },
        form: { rocker: 1.55, ribs: 8, ribH: 0.058, plate: true, ankle: 0, laces: 5 },
      },
      {
        id: 'frog', range: 'sport', sport: 'Basketball', word: 'HOOPS',
        name: 'Frog',
        kind: 'Basketball, high-top',
        learned: 'the tree frog toe pad',
        terrain: 'Hardwood · dusty courts · outdoor asphalt',
        price: 185,
        color: 'Leaf / Cobalt / Flare',
        swatch: ['#6FD13B', '#1F4FE0', '#F2542D'],
        accent: '#6FD13B',
        stage: '#2A1E33', ink: 'light',
        line: 'Hexagonal pads split by drain channels, so a dusty court grips like a clean one.',
        how: {
          animal:
            'A tree frog’s toe pad is a mosaic of hexagonal cells divided by tiny channels. The channels carry water and dirt away so the cells stay in contact, which is how a frog holds on to a wet leaf upside down and still lets go cleanly.',
          sole:
            'The Frog outsole is a field of hexagonal pads separated by deep channels. Dust and sweat are pushed into the channels instead of under the rubber, so the hundredth cut grips like the first. A round pivot pad under the ball of the foot lets you spin without skidding.',
        },
        specs: { weight: '410 g', drop: '9 mm', stack: '28 / 19 mm', lug: 'Hex pads, 3 mm', cut: 'High, with ankle strap', rubber: 'HF Toe Pad' },
        grip: { Hardwood: 5, 'Dusty court': 5, 'Outdoor court': 4, 'Wet court': 3 },
        mu: 0.83, muLabel: 'Dusty-hardwood friction',
        mat: { upper: '#6FD13B', mid: '#1F4FE0', sole: '#F2542D', accent: '#F2542D', wire: '#2c6a12' },
        form: { rocker: 0.7, ribs: 5, ribH: 0.066, ankle: 1, laces: 7, strap: true },
      },
      {
        id: 'mako', range: 'sport', sport: 'Soccer', word: 'SOCCER',
        name: 'Mako',
        kind: 'Football boot, firm ground',
        learned: 'the shark’s skin',
        terrain: 'Wet grass · firm ground · rain',
        price: 240,
        color: 'Abyss / Belly / Bite',
        swatch: ['#1C2A4A', '#EEF1F2', '#E63B2E'],
        accent: '#E63B2E',
        stage: '#D5DDE0', ink: 'dark',
        line: 'A skin of tiny ribbed scales that holds a wet ball, over studs shaped like teeth.',
        how: {
          animal:
            'Shark skin is covered in dermal denticles: tiny ribbed scales shaped like teeth. They lie flat one way and catch the other, channelling water along the body. Stroke a shark from tail to head and it grips like sandpaper.',
          sole:
            'The Mako copies it twice. The upper is printed with raised denticles that catch a wet ball when you strike or trap it. Underfoot, blade studs shaped like shark teeth, raked back under the forefoot and forward under the heel, cut in and turn without tearing the turf.',
        },
        specs: { weight: '196 g', drop: '6 mm', stack: '11 / 5 mm', lug: 'Blade studs, 12 mm', plate: 'Nylon soleplate', rubber: 'HF Denticle upper' },
        grip: { 'Wet grass': 5, 'Firm ground': 5, 'Ball in rain': 5, 'Artificial turf': 3 },
        mu: 0.88, muLabel: 'Wet-ball friction, upper',
        mat: { upper: '#1C2A4A', mid: '#EEF1F2', sole: '#C9D3DB', accent: '#E63B2E', wire: '#5a7bb0' },
        form: { rocker: 0.35, ribs: 1, ribH: 0.05, ankle: 0.42, laces: 0, studs: true },
      },
      {
        id: 'ibex', range: 'sport', sport: 'Hiking', word: 'HIKE',
        name: 'Ibex',
        kind: 'Hiking boot, mid',
        learned: 'the ibex hoof',
        terrain: 'Scree · rock steps · wet trail',
        price: 230,
        color: 'Bone / Rust / Coal',
        swatch: ['#E9E4D8', '#C4501E', '#1A1A18'],
        accent: '#C4501E',
        stage: '#2F3B2A', ink: 'light',
        line: 'A hard rim that bites edges around a soft pad that moulds over rock, like a hoof.',
        how: {
          animal:
            'An ibex stands on cliff ledges no wider than a hand. Each hoof has a hard rim that catches edges, around a soft, rubbery pad that moulds to the rock, and its two toes spread apart under load to pinch the stone between them.',
          sole:
            'The Ibex outsole has a rim of hard block lugs for edging, around a softer, flatter centre pad that wraps over rounded rock. A split at the toe lets the two halves flex apart on uneven ground, and a brake lug at the heel bites on the way down.',
        },
        specs: { weight: '520 g', drop: '10 mm', stack: '34 / 24 mm', lug: '6 mm rim, soft centre', cut: 'Mid, waterproof', rubber: 'HF Hoof, two hardnesses' },
        grip: { 'Wet rock': 5, Scree: 5, Mud: 4, Snow: 3 },
        mu: 0.84, muLabel: 'Wet-granite friction',
        mat: { upper: '#E9E4D8', mid: '#1A1A18', sole: '#26231f', accent: '#C4501E', wire: '#6c665a' },
        form: { rocker: 0.6, ribs: 5, ribH: 0.07, ankle: 0.72, laces: 7 },
      },
      {
        id: 'beetle', range: 'sport', sport: 'Trail', word: 'TRAIL',
        name: 'Beetle',
        kind: 'Mountain trail racer',
        learned: 'the tiger beetle claw',
        terrain: 'Mud · roots · steep wet trail',
        price: 195,
        color: 'Coal / Emerald shift',
        swatch: ['#121412', '#1E9E6E', '#6D4BC9'],
        accent: '#1E9E6E',
        stage: '#C8C0D6', ink: 'dark',
        line: 'Hooked lugs that pull you uphill and brake downhill, under an upper that shifts emerald to violet.',
        how: {
          animal:
            'For its size, the tiger beetle is the fastest runner on Earth. Each foot ends in two curved claws that hook into the ground, and the hooks face both ways, so it can stop dead from full speed on loose sand.',
          sole:
            'The Beetle outsole is cut into hooked lugs. Under the forefoot they curl back to pull you up a climb; under the heel they curl forward to brake on the way down. Open channels between the hooks shed mud with every stride.',
        },
        specs: { weight: '262 g', drop: '4 mm', stack: '27 / 23 mm', lug: '6.5 mm hooks', cut: 'Low, knit gaiter collar', rubber: 'HF Hook' },
        grip: { Mud: 5, 'Wet roots': 4, 'Loose ground': 5, 'Wet rock': 3 },
        mu: 0.78, muLabel: 'Wet-mud friction',
        mat: { upper: '#151815', mid: '#1E9E6E', sole: '#0c0d0c', accent: '#6D4BC9', wire: '#1E9E6E' },
        form: { rocker: 0.95, ribs: 5, ribH: 0.06, ankle: 0.22, laces: 5 },
      },
      {
        id: 'spider', range: 'sport', sport: 'Tennis', word: 'TENNIS',
        name: 'Spider',
        kind: 'Tennis & padel',
        learned: 'the jumping spider foot',
        terrain: 'Clay · hard court · padel turf',
        price: 170,
        color: 'Chalk / Clay',
        swatch: ['#F2F1EC', '#D4572F', '#151515'],
        accent: '#D4572F',
        stage: '#1F4A3A', ink: 'light',
        line: 'A web of spokes and rings around a pivot under the ball of the foot, for slides that stop on the line.',
        how: {
          animal:
            'A jumping spider walks up glass and lands its jumps on anything. Each foot carries a scopula: a dense pad of branching hairs that spreads the load in every direction at once, so it can grip, pivot and push off sideways.',
          sole:
            'The Spider outsole is drawn as a web. Spokes run out from a round pivot under the ball of the foot and a second under the heel, crossed by rings, so the shoe grips the same in every direction. Slide into a wide ball and it slows evenly and stops on the line.',
        },
        specs: { weight: '360 g', drop: '7 mm', stack: '26 / 19 mm', lug: 'Web, 2.5 mm', cut: 'Low, lateral outrigger', rubber: 'HF Scopula' },
        grip: { Clay: 5, 'Hard court': 5, 'Padel turf': 4, 'Wet court': 3 },
        mu: 0.8, muLabel: 'Hard-court friction',
        mat: { upper: '#F2F1EC', mid: '#E3E1D9', sole: '#D4572F', accent: '#151515', wire: '#151515' },
        form: { rocker: 0.6, ribs: 4, ribH: 0.06, ankle: 0, laces: 6 },
      },
    ],
    ranges: {
      shore: { name: 'Shore', title: 'Four ways to hold.', note: 'For the wet places: rock, city rain, decks, slab.' },
      sport: { name: 'Sport', title: 'Six ways to win.', note: 'Six sports, six animals that grip at speed.' },
    },
    /* The ordinary sole the Grip Lab compares against. */
    baseline: { name: 'Ordinary trail sole', mu: 0.42 },
  };
  var H = root.HOLDFAST;
  H.models.forEach(function (m) { m.range = m.range || 'shore'; m.form = m.form || {}; m.muLabel = m.muLabel || 'Wet-granite friction'; });
  H.byId = H.models.reduce(function (a, m) { a[m.id] = m; return a; }, {});
  /* shore: the original four (Grip Lab, ramp, field, the Kelp taken apart). sport: the six sport shoes. */
  H.shore = H.models.filter(function (m) { return m.range === 'shore'; });
  H.sport = H.models.filter(function (m) { return m.range === 'sport'; });
})(window);
