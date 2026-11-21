# Holdfast · shoes that don’t let go

**Live:** https://ruibinray.github.io/WebDesign4/ (GitHub Pages, deployed from `main`, root folder; repository [RuibinRay/WebDesign4](https://github.com/RuibinRay/WebDesign4)).

Concept shoe brand. The brief was “Grip, or a better name.” **Holdfast** keeps the idea and gives it a story: a kelp’s holdfast is the knot of fingers that grips bare rock through storms. There are two lines. **Shore** copies four animals that never slip on wet ground. **Sport** copies six that grip at speed.

**Shore**

| Shoe | Learned from | For | Price |
|---|---|---|---|
| **Kelp** | the kelp holdfast: branching root lugs that wrap over the toe | Coastal trail, wet rock | $165 |
| **Gecko** | the gecko toe: hundreds of razor-fine sipes | Wet city: paint, tile, steel | $140 |
| **Octo** | the octopus sucker: soft suction pods, drain ports | Decks, weed, tidepools | $120 |
| **Limpet** | the limpet shell: smooth smearing toe, ring-lug heel | Granite, slab, scree | $180 |

**Sport** (added 2026-11-21, on “design cooler looking shoes for running basketball soccer and hike and etc”)

| Shoe | Sport | Learned from | Build | Price |
|---|---|---|---|---|
| **Cheetah** | Running | the cheetah claw: raked claw pods under the forefoot | Road racer, tall rocker foam, full-length carbon plate. Sun gold on night blue | $250 |
| **Frog** | Basketball | the tree frog toe pad: hex pads split by drain channels, pivot pad | High-top with ankle strap. Leaf green, cobalt, flare orange | $185 |
| **Mako** | Soccer | shark skin: denticle-textured upper, blade studs like teeth | Laceless firm-ground boot, sock collar. Abyss blue fading to white | $240 |
| **Ibex** | Hiking | the ibex hoof: hard rim lugs around a soft centre pad, split toe | Mid boot. Bone, rust, coal | $230 |
| **Beetle** | Trail | the tiger beetle claw: hooked lugs, back under the forefoot, forward under the heel | Mountain trail racer, knit gaiter collar. Black with an emerald-to-violet sheen | $195 |
| **Spider** | Tennis & padel | the jumping spider foot: a web of spokes and rings round two pivots | Court shoe with outrigger. Chalk white, clay-red sole | $170 |

**Look:** basalt black `#0E1110`, sea fog `#C5CCC4`, surf white `#EDEFE8`, and one colour borrowed from map lichen, `#C9F03C`. Secondary: ember `#E8772E`, tide `#12383A`, coral `#F28C7A`. Type: Archivo at full width (125) for display, the stance you take on something slippery, and Martian Mono for labels. Product shots are colour-blocked: each shoe has its own backdrop.

## What the page does

| Piece | How it works | Before Higgsfield | After |
|---|---|---|---|
| **Hero film** | A 300 svh section pins the screen; scrolling plays a 10 s film forward and back. Copy “chapters” fade in at set moments (“Don’t let go.” → “The wave hits.” → “The shoe stays.”). A film HUD shows the timeline, beats and timecode. Portrait phones play their own film, shot vertically (`film-hero-m`), so the whole shoe stays in frame. | The storyboard plays: the HUD reads out each beat as you scroll | Frames drawn on a canvas; with only the start and end stills, a slow push-in crossfade |
| **03 Sport stage** | Pinned, six chapters, one per sport. The real-time 3D shoe is rebuilt for each sport from its `form` (high-top, studs, carbon plate, mid boot…) and turns from front to back as you scroll, opening slightly mid-turn. The stage takes the shoe's colour, a giant outlined word (RUN, HOOPS, SOCCER, HIKE, TRAIL, TENNIS) slides past, and the tread draws itself. Tabs are progress bars; click or use the arrow keys; drag to turn. Phones show the shoe over a short panel, with numbered tabs. | Works fully (drawn, not generated) | Same |
| **Press film** | Same engine, 5 s macro: the sole lands and squeezes the water out | Storyboard | Frames |
| **04 Grip Lab** | Pinned, four chapters (one per animal, about 115 svh each). Within a chapter, scroll plays that animal's 5 s film (kelp holdfast in a surge, gecko toes flattening on glass, octopus suckers sealing, limpets under a wash) while that shoe's tread draws itself line by line. The tabs are progress bars; clicking one (or using the arrow keys) jumps to that animal. On phones the text switches from "how it holds" to "how the sole copies it" halfway through. Frames come from `assets/film/lab-<id>/d` through `HF_SEQ` in `js/film.js`. | The nature photo with a slow push-in | Frames |
| **3D Kelp, taken apart** | A real-time three.js shoe built from the same tread data as the drawings: lugs, ribbed midsole with toe spring, footbed, knit upper with laces and heel loop. Scrolling turns it and explodes it layer by layer, one step per feature. Stop between steps and it settles onto the nearest one; arrow keys step through; drag to turn it at any step, and it eases back when you let go. | Works fully | Same (it is drawn, not generated) |
| **3D on the shoe page** | Drag to turn; Turn / Side / Sole / Apart buttons. Leads the gallery until the photos exist. | Drawn 3D shoe in that model’s colours and tread | A textured Tripo 3D model from Higgsfield, if made |
| **Page transitions** | View Transitions API: the shoe image and name morph from the home card (or the “other shoes” row) into the shoe page; the rest of the page skids in | Works | Works |
| **Tide lines** | The edge between dark and light sections is a wave that rolls with the scroll | Works | Works |
| **Smooth scrolling** | Lenis on desktop with full motion; native scrolling on phones and with reduced motion | Works | Works |
| **Section gauge** | A tide gauge down the right edge: where you are, how far down; labels on hover | Works | Works |
| **Drawn treads, ramp test, skid headline, clip-reveal images** | Code-drawn signature pieces | Works | Works |

## Pages

| Page | What it is |
|---|---|
| `index.html` | Home: hero film, the holdfast story, press film, the range (Shore cards, the Sport stage, Sport cards with a line-up banner), Grip Lab + ramp test, the Kelp taken apart in 3D, a pinned sideways field gallery of all ten, sign-up |
| `shoe.html?m=kelp` | Shoe page, one template for all ten (`?m=gecko`, `?m=mako`, `?m=spider` …): 3D view and photos, size picker with sold-out states, bag, how it grips, specs, grip meters |
| `shots.html` | The shot sheet (not linked from the site): every image, film and 3D model with its prompt, model, inputs, price, status and copy buttons |

## The Sport line: not generated yet

The six sport shoes are fully built: data, treads, 3D, the stage, cards, shoe pages, and every prompt in `js/shots.js`. Until their photos exist, their slots show designed placeholders in each shoe's colour. **37 assets, 104.72 credits** (dry run on 2026-11-21, balance 2,714.30):

| What | Count | Credits |
|---|---|---|
| Masters (`<id>-side`), then pair, sole and field from each master | 24 | 48.00 |
| The six together (`sport-lineup`, 21:9, the six masters as references) | 1 | 2.00 |
| Their animals (`nature-<id>`, Soul Cinematic) | 6 | 0.72 |
| Textured 3D models (`3d-<id>`, Tripo). Optional: the drawn 3D already shows each build | 6 | 54.00 |

`node higgsfield/generate.mjs images --go` makes the 31 images (50.72); `3d --go` makes the models. Nothing runs without `--go`.

## Generated on Higgsfield (2026-11-20)

**The Shore line's 39 assets are made, reviewed and live:** 28 images, 4 textured 3D models and 7 scroll films (hero, its vertical phone version, press, and the four Grip Lab animal films), for about **253.5 credits** (GPT Image 2.6 was 2.00 a shot that evening, not the 2.75 first quoted). The four Grip Lab films (75 credits) start from the nature photos, with no end frame, and keep their 3:4 shape (`aspect: 'auto'`); all four were right on the first roll. Nothing on the site is a placeholder any more; `shots.html` reads 39 of 39 ready.

| Stage | What | Model |
|---|---|---|
| 1 | Four shoe masters (studio side profile) + five nature shots | GPT Image 2.6 · Soul Cinematic |
| 2 | Every other shot of each shoe, with its master as reference; hero, phone hero, closing | GPT Image 2.6 |
| 3 | Film frames (hero-end from hero, hero-m-end from hero-m, press-start) + four 3D models | GPT Image 2.6 · Tripo H3.1 |
| 4 | press-end, made *from* press-start so the film's two ends share one camera | GPT Image 2.6 |
| 5 | Hero film (10 s, 16:9), phone hero film (10 s, 9:16) and press film (5 s), image to video between start and end frames | Kling 4.0 1080p |

What review changed:
- **The limpet nature shot** first came back as spiral sea snails. The prompt now says flat cone shells and "not snails".
- **The first press end frame** faced the opposite way from its start frame. It is now made from the start frame, as `hero-end` is.
- **The hero photo** put the shoe at 52–95% of the width. The crop focus and push-in origin moved to 86%.
- **Each Tripo model** arrived at about 45 MB. The optimiser now shrinks them to 1.0–4.5 MB (glTF-Transform: simplified, quantized, 1K WebP textures). Scanned models are shown darker so their baked light does not wash out.
- **The colour pass:** the studio backdrops came back a few points off the asked hexes (Octo #F0C9B8 → #E9BAAB). The hexes in `js/shots.js` are now the sampled ones (`tools/sample-backdrops.mjs`). Contained studio shots fade their side edges into the backdrop, so no rectangle shows.
- **Six Higgsfield failures** (timeouts, an upload error, a validation error) cost nothing and succeeded on retry.

- **On phones the landscape hero film cropped the shoe's heel** (the shoe is too wide for a tall frame). A vertical film now plays there instead (`film-hero-m`, 39.5 credits including its end frame). Any film can have one: give a 9:16 film `phoneOf: '<name>'` in `js/shots.js`. `js/film.js` plays it on portrait phones, and the optimiser then skips the landscape film's phone crop.

- **Film brightness:** measured after cutting (out of 255: hero 98, phone hero 77, press 50). Dark films get a lift when they are cut: `grade` (an ffmpeg gamma) on the film in `js/shots.js` (press 1.35, phone hero 1.15). The sharp stills swapped in as the first and last frames are matched to their neighbouring frame's brightness, so the page never jumps where it rests.

**Review tools:**
- `node tools/contact-sheet.mjs [prefix …]` makes a labelled sheet of renders.
- `node tools/film-strip.mjs <film>` shows seven frames across a cut film.
- `node tools/sample-backdrops.mjs` reads the real backdrop colours.
- `tools/treads.html` shows every tread on its colour; `tools/shoes3d.html?view=side|three|sole|explode` shows every drawn 3D shoe at once (open them through `node tools/serve.mjs`).

The pipeline below is how to re-make or re-roll anything.

**Automatic**, with the Higgsfield CLI logged in:

```powershell
node higgsfield/generate.mjs
```

That prints the plan, the cost of every job and your balance, and spends nothing. Then, for everything:

```powershell
node higgsfield/generate.mjs --go
```

Or a group at a time: `node higgsfield/generate.mjs images --go`, then `3d --go`, then `films --go`. It runs the stages in order, stops before spending if the balance is short, skips (without spending) anything whose reference isn’t made yet, writes `higgsfield/manifest.json`, and finishes by running the optimiser.

- Re-roll one: `node higgsfield/generate.mjs hero --go --force` (the old file is kept as `hero_v1.png`)
- Upgrade pass: `node higgsfield/generate.mjs images --go --force --quality xhigh`

**By hand**, in the Higgsfield app: open `shots.html`, copy each prompt, use the model, aspect and inputs it shows, and save the download as `higgsfield/renders/<id>.png` (films `.mp4`, 3D `.glb`). Then:

```powershell
node higgsfield/optimize.mjs
```

The optimiser writes:
- **Images:** `assets/img/<id>.webp` (2000 px) and `-sm.webp` (900 px), plus the social card `og.jpg`.
- **Films:** frame sequences in `assets/film/<name>/d/` (1600 px, 12 fps) and `m/` (720 × 1280 portrait crop for phones), using ffmpeg. The first and last frames are swapped for the sharp start and end stills, where the page rests.
- **3D models:** `assets/3d/<model>.glb`, compressed from Tripo's ~45 MB to 1–4.5 MB with glTF-Transform (`npm install` brings it).
- **Ready list:** `assets/img/ready.js`, the list the site reads, so it never requests a missing file.

## Edit the content

- **Range data:** the range, copy, prices, specs, grip ratings and 3D colours are in `js/data.js`. `range` puts a shoe in Shore or Sport; a sport shoe also has `sport`, `word`, `stage`/`ink` (its stage colour, the same hex as its photo backdrop) and `form` (how the 3D shoe is built).
- **Prompts:** every prompt, film and 3D job, the look bible and the shoe descriptions are in `js/shots.js`. One change there changes every prompt that uses it.
- **Treads:** `js/soles.js` defines them once, as primitives. The same data draws the 2D treads and builds the 3D lugs.
- **Films:** chapter timing is the `data-in` / `data-out` attributes in `index.html`; beats and duration live in `js/shots.js`; the engine is `js/film.js`.
- **3D:** edit `js/src/shoe3d.src.js`, then rebuild the bundle with `node tools/build-3d.mjs`. The output `js/shoe3d.js` is committed, so the site itself has no build step. The scroll steps of the exploded view are `K` in that file and `STEPS` in `js/home.js`.
- **Colours, type, layout:** `css/holdfast.css` (tokens at the top).

## Run it locally

```powershell
node tools/serve.mjs
```

Then open http://localhost:4180/. `npm install` is only needed for the optimiser (`sharp`) and the 3D build (`esbuild`, `three`). Lenis is vendored in `assets/vendor/`.

Motion is full on desktop by default; phones follow the system “reduce motion” switch, and the “Motion on/off” switch at the top right of the nav lets anyone change it (remembered in `localStorage`, key `holdfast.motion`). Reduced motion turns off smooth scrolling, page transitions and decorative animation; the films still follow the scroll, because the visitor drives them. Adding `?sync` to the URL is a testing aid for background browser tabs, where animation frames never fire.

## Publish on GitHub Pages

Push this folder to a repository, then Settings → Pages → Deploy from a branch → `main`, folder `/ (root)`. All paths are relative. `higgsfield/renders/` (the full-size originals) and `node_modules/` are excluded by `.gitignore`; back the renders up somewhere of your own.

## Before a real launch

- **Name:** check “Holdfast” for trademarks in footwear (class 25) in your markets before spending on it.
- **Concept values:** prices, weights, stack heights, friction figures (μ), grip ratings, “60-day returns” and the re-grip service are proposals for the concept. Replace them with real values and lab results.
- **Sign-up and bag** are front end only. Connect a mailing-list provider and a store.
- Help links in the footer (Sizing, Returns, Repairs) are plain text until those pages exist.
