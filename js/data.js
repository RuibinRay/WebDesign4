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
    ],
    /* The ordinary sole the Grip Lab compares against. */
    baseline: { name: 'Ordinary trail sole', mu: 0.42 },
  };
  root.HOLDFAST.byId = root.HOLDFAST.models.reduce(function (a, m) { a[m.id] = m; return a; }, {});
})(window);
