# Mercy's 2v2 Invitational — working notes

Show-specific knowledge for anyone (person or agent) picking this studio up. The
framework's rules are in [AGENTS.md](AGENTS.md); read that first. This file is what
that one cannot know: the event, the decisions made with the producer, and what was
learned building it. Keep it current — when something is learned, it goes here.

## Working agreements

- **Do not commit or push until asked.** The producer iterates in the working tree.
- **Verify by looking.** Every graphic change gets a screenshot at 1920×1080; every
  board change gets screenshots at 768, 1024, 1280 and 1600px wide. See
  [Checking your work](#checking-your-work).
- **Board layouts start at `md` (768px).** Design for md and up; below md only has to
  degrade, not look designed.
- **Flag core gaps.** The producer maintains Single Studio. When a studio works around
  something core lacks, keep the workaround small and say what the core change would
  be. Open ones are listed under [Upstream notes](#upstream-notes).

## The event

Two pools of four teams play a round robin; the top two of each pool go to a
four-team single-elimination bracket (Semifinal 1: A1 v B2, Semifinal 2: B1 v A2,
then the Final). No plugins — every value is typed on the board.

All graphics are full-screen and sit **outside the game scene**. Brand assets came
from the client: `mercbkg.png` (sky), `2v2InviteText.png` (logo, "presented by
Syncd"), `Mercy.png` (the mascot). The client's two mockups (a caster layout and a
slate) were used for reference and deliberately not committed: the repo and its Pages
site are public, and one shows the casters' photos.

## Graphics and OBS

| Source | URL | Notes |
|---|---|---|
| Background | `#/source/background` | The animated sky. **Its own layer**, under everything. |
| Slate | `#/source/slate` | Mercy, logo, message, optional countdown. Transparent. |
| Caster webcams | `#/source/caster-webcams` | Two 16:9 frames + name plates + message bar. Transparent. |
| Group standings | `#/source/group-standings` | Both pools, ranked. Transparent. |
| Bracket | `#/source/bracket` | Semis → Final, champion banner. Transparent. |

Stacking, bottom to top: **background → (cameras) → graphic**. Each scene gets its own
copy of the background; copies stay in step (see below), so cuts are seamless.

Caster cameras go **below** `caster-webcams`, at x 120 / x 1000, y 280, 800×450. If a
camera is not 16:9, use Edit Transform → "Scale to outer bounds" at 800×450 with
"Crop to Bounding Box". **No OBS mask is needed** for the rounded corners: the frame's
two solid rings (6px cream, 6px blue, drawn outside the window) cover the camera's
square corners, and a few pixels of misalignment on any edge.

## Data

Everything is under `variables` unless noted. Shape and ranking live in
[src/components/tournament.js](src/components/tournament.js), shared by graphics,
board and mutations so they never disagree about who is first.

| Path | What |
|---|---|
| `slate.message` | Slate text. Fallback "Starting Soon". |
| `timers.slate` | The slate countdown (a `timers` path, not `variables`). |
| `casters.{1,2}.name` / `.handle` | Name plates. Handle optional. |
| `casters.message` | Bar under the cameras; empty hides it. |
| `standings.title` / `.note` / `.a` / `.b` / `.logos` | Headings, footer, group names, `'hidden'` hides logos. |
| `groups.{a,b}.{1-4}.name` / `.players` / `.logo` | A team, at a fixed slot. Players and logo optional. |
| `groups.{a,b}.{1-4}.w` / `.l` / `.pts` / `.tb` | Results. Counters (Stepper writes increments). |
| `bracket.title` / `.logos` | Heading, `'hidden'` hides logos. |
| `bracket.{sf1,sf2,final}.{top,bottom}.team` | Which team: a group slot key, `a1`–`b4`. **A reference, not a copy** — name, players and logo are looked up in `groups` on the way to air, so the bracket can never drift from the groups. |
| `bracket.{sf1,sf2,final}.{top,bottom}.seed` / `.score` | The seed label on air (`A1`; fixed when seeded, editable) and the score. |
| `bracket.{sf1,sf2,final}.winner` | `'top'` or `'bottom'`. |

**Ranking:** points, then wins, then fewest losses, then `tb` (tiebreak — board only,
never on air; the producer applies whatever the event rules say), then slot order.
Teams level on all four share a rank. Until a group has any result, ranks are 1–4 in
slot order.

**Advancing** (the highlight) means *through*: in the top two and not level with the
team in 3rd. A tie across the cut marks neither team until a result or a tiebreak
separates them (1-0-0-0 points: one team through, three unmarked, all reading "2").
`bracket:seed` still seeds by position, so with a tie across the cut it falls back to
slot order — set a tiebreak first.

**Mutations** ([src/mutations/tournament.js](src/mutations/tournament.js)):
`groups:reset` (zero W/L/Pts/TB, keep names), `bracket:seed` (semis from current
standings — writes team keys and seed labels, clears all scores/results),
`bracket:winner { match, side }` (toggle; a semi's winner's team key and seed label
go into the final, Semi 1 → top, Semi 2 → bottom; changing a semi clears a final the
old winner had won), `bracket:reset`.

**Seeding is a guess** (A1 v B2, B1 v A2) the producer has not confirmed. The escape
hatch is the board: every bracket slot is a dropdown of all eight teams and the seed
label is free text, so any pairing can be set by hand without breaking the link to
the groups.

Show data lives in the browser that runs the board (IndexedDB), not in the repo. Test
data typed into Chrome does not appear in OBS — run the board as an OBS custom dock to
share one store with the browser sources.

## Design system

- **Palette** — `@theme` tokens in [src/css/index.css](src/css/index.css):
  `merc-blue #0f4fd6` (the logo's blue), `merc-bright`, `merc-deep`, `merc-ink`,
  `merc-night`, `merc-cream #f4f3ef` (the logo's outline).
- **Type** — Archivo variable, bundled from `@fontsource-variable/archivo` (the `wdth`
  file, so the width axis 62–125% works) and imported by
  [Stage.jsx](src/components/Stage.jsx) so only graphics carry it. Bundled rather than
  Google Fonts so air does not depend on the network.
- **Utilities** — `type-display` (wide, black, upper case), `sticker` (the logo's
  blue-with-cream-edge look, usually with a slight rotate), `glass` (navy card over
  the sky).
- **Brand files** — `public/brand/logo.png` (1411×616) and `mercy.png` (1077×1174)
  are the originals trimmed to their visible pixels with
  [scripts/trim-png.mjs](scripts/trim-png.mjs), so they can be sized by what shows.

### Pieces worth knowing

- [Stage](src/components/Stage.jsx) — every graphic is laid out in fixed 1920×1080
  pixels and scaled to the source, so a browser preview is the on-air picture.
- [SpaceBackground](src/components/SpaceBackground.jsx) — mercbkg plus stars, glints,
  dust, nebula and comets, transform/opacity only. Stars come from a **fixed seed**,
  and every animation's phase is set from the **wall clock** (a negative
  `animation-delay` computed at mount), so separate copies and scene cuts line up.
  Dust tiles are slid exactly one tile per loop, so the loop is seamless.
  Two rarer layers on top: **glints** — the four bright stars painted into mercbkg
  flare into a long four-point cross every 23–41s (periods share no factor, so no
  pattern); they live *inside* the image layer at the stars' image-percent positions
  so they breathe with it and stay on their stars — and **shards**, eight of Mercy's
  diamond sparkles (blurred orange/blue fringes, white core, every other one with a
  small companion) rising bottom to top and swaying. Their gradient and blur are one
  shared `<defs>` referenced by id.
- [Fitted](src/components/Fitted.jsx) — one line, never wraps or clips: narrows the
  font's width axis 125% → 75%, then `scaleX` with no floor. Team names and the
  group-name stickers use it. Room is tight on the standings: a team name gets
  ~230px with logos shown, so even "Comet Crew" (10 characters) is narrowed there;
  ~15–18 still read well, 25+ get cramped. The bracket gives names more room.
  Hiding logos adds ~110px on the standings.
- Group-name stickers hug a short name and stop at 452px — what the W / L / PTS
  labels leave — then fit. A content-sized box with a `max-w` works with Fitted;
  core's `<Variable fit>` does not, because it measures against the first ancestor
  whose width does not depend on the text, which here is the whole 800px row.
- [FitLines](src/components/FitLines.jsx) — wraps, but steps the font down (slate:
  76 → 52px) to stay within N lines; past the floor it wraps further rather than
  shrink into unreadable.
- The slate keeps room for two full lines of message and for the countdown even when
  either is short or off, so changes on air never move the logo.

## The board

- Panels: Slate, Caster webcams, Group standings, Group A, Group B, Bracket, then the
  three matches.
- [Panel](src/control/Panel.jsx) — core `Panel`'s markup plus two things: an
  `actions` slot for header buttons (Reset countdown, Swap casters, Zero all results,
  Seed / Clear bracket; they take `HEADER_BUTTON`), and folding — the title is a
  button that collapses the body, actions stay usable while folded. Every panel on
  this board goes through it.
- Folding, panels and team cards alike, is [collapse.jsx](src/control/collapse.jsx):
  `useCollapsed(initial = true)` is plain component state. **Everything starts
  folded on every load** — panels and team cards — the producer's call: a fresh
  board is a short list of headers. Not the show store (that would fold everybody's
  board) and not browser storage, so a reload is always the same board.
- The body needs the `hidden` *class* as well as the attribute: core's
  `.ss-panel-body { display: flex }` beats `[hidden]`. Grids of panels need
  `items-start`, or a folded panel stretches to its neighbours' height.
- [FillStepper](src/control/FillStepper.jsx) — a `Stepper` whose number field fills its
  column. The stock one is a fixed 160px and sits in the corner of a wider cell.
- Groups: one card per team, top to bottom; 2 across at md, 4 from lg. A card
  folds to one line — slot, saved name, record (`A1 · Comet Crew · 2–0 · 6 pts`) — so
  a folded group still reads at a glance; the name field is labelled "Name" since
  the card header carries the slot. The four
  steppers go two-up via a **container query** on the card (`@2xs:grid-cols-2`),
  since card width depends on how many share the line, not on the window.
- Bracket: matches stack at md and go 3 across from lg (a third of the board at md is
  ~200px — too narrow for a stepper and anything beside it). Each team is one `Row`:
  `md` 5/2/3/2 on one line, `lg` 8/4 + 8/4 on two.
- [Divider](src/control/Divider.jsx) — an `<hr>` between groups of controls in a
  panel (Slate, Caster webcams, Group standings). Core's `Break` is deprecated and
  draws nothing.
- Zebra striping: even panels are lighter (rule in `index.css`, scoped to
  `.ss-control`), and team cards / bracket teams alternate with `odd:`/`even:`.
- `.ss-control { color-scheme: dark }` makes native widgets (the time input's clock
  icon, select popups, scrollbars) light-on-dark.

## Gotchas learned

- **Core's control CSS is in `@layer components`**, so any Tailwind utility on a
  control beats it regardless of specificity — `basis-0`, `min-w-24` and friends just
  work. But two *utilities* for one property tie and are settled by stylesheet order,
  so overriding a framework button's own padding/min-height needs `!`
  (`min-h-0! px-2.5! py-1! text-xs!`).
- **`Row` media queries are viewport-based.** A Row inside a third-width panel still
  goes side by side at 48rem. Size controls with `col-span-*` per breakpoint (or a
  container query), not by trusting the Row's default.
- **Measure text after the webfont loads.** `document.fonts.ready` can resolve before
  a lazily-used font starts loading; a `ResizeObserver` on the text catches the swap.
- `useVelcroCollection('variables.groups')` / `ctx.collect` return **flat keys**
  relative to the prefix (`'a.1.name'`), counters included.
- `ctx.write` with a number on a counter path resets it; `undefined` removes it.
- The `Timer` component's `fallback` shows when no clock runs — the slate passes `''`
  and uses `useTimer('timers.slate').active` to fade the box rather than collapse it.
- CSS imported from one graphic only ships with that graphic (`src/css/slate.css`).
  `space.css` ships with the background.

## Checking your work

There is no test suite; screenshots are the check. What worked here, without touching
the project's dependencies:

1. Install Playwright somewhere outside the repo (`npm i playwright` in a temp dir,
   then `npx playwright install chromium-headless-shell`).
2. On this WSL machine Chromium is missing `libnss3`, `libnspr4` and `libasound2`. No
   sudo needed: `apt-get download libnspr4 libnss3 libasound2t64`, `dpkg-deb -x` each
   into a folder, and run with `LD_LIBRARY_PATH` pointing at its
   `usr/lib/x86_64-linux-gnu` and `usr/lib/x86_64-linux-gnu/nss`.
3. `npm run dev -- --port 5199 --strictPort`, then screenshot `#/source/<name>` at a
   1920×1080 viewport.
4. **Seeding data:** wrap `SharedWorker` in an init script to keep the page's port,
   then post mutations straight to the worker:

   ```js
   await page.addInitScript(() => {
     const Original = window.SharedWorker
     window.SharedWorker = function (url, options) {
       const worker = new Original(url, options)
       window.__port = worker.port
       return worker
     }
   })
   await page.goto(`${BASE}#/source/slate`)
   await page.waitForFunction(() => window.__port)
   await page.evaluate(() => window.__port.postMessage({ type: 'mutate', name: 'set', payload: { 'variables.slate.message': 'Hi' } }))
   ```

   Each Playwright launch is a fresh profile, so seed in the same run you shoot.
5. **Rare moments** (a glint, a comet): pause everything and seek, rather than
   waiting for one. `document.getAnimations()`, `pause()` each, then set
   `currentTime` so active time lands where you want — with a negative delay, active
   time is `currentTime - delay`.
6. **Layering:** to see a transparent graphic over the sky, `page.setContent` a page
   with two full-size iframes (background, then the graphic), plus coloured boxes at
   the camera positions for `caster-webcams`. Write data from a studio page first;
   the composite page has no port.

## Open questions for the client

1. How are group points awarded? Pts is typed by hand; if it is a fixed amount per
   win it could be derived from W.
2. Always two casters, or are solo / three-caster layouts needed?
3. Will teams have names, or be known by their players? The Players field is optional
   and hidden on air when empty; remove it if it is never used.

## Upstream notes

Studio workarounds that could become Single Studio defaults:

1. An `actions` slot and folding on core `Panel` (folded on load) — then delete
   `src/control/Panel.jsx`.
2. A compact size (e.g. `size="sm"`) on `Confirm`, `ResetButton`, `SwapButton`,
   `Toggle`, so header buttons need no `!` overrides.
3. `color-scheme: dark` on the board in core's `base.css`.
4. A stepper that fills its column, as an option on `Stepper` — then delete
   `src/control/FillStepper.jsx`.
