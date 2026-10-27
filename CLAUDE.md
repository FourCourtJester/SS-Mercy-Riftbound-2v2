# Mercy's 2v2 Invitational — working notes

Show-specific knowledge for anyone (person or agent) picking this studio up. Claude
reads this file automatically; other agents arrive through [AGENTS.md](AGENTS.md),
which points here and holds the framework's own rules — read both. This file is what
AGENTS.md cannot know: the event, the decisions made with the producer and the
client, and what was learned building it. Keep it current — when something is
learned, it goes here. [README.md](README.md) is the human guide (OBS setup, running
the show); keep its operator steps in line with this file.

**State of play (2026-10-27):** built, released and live. v1.0 and the client's first
round of feedback (v1.1) are merged. PR #3 carries the README rewrite, the handover
notes and a second client request — the caster message wrapping to two lines before
it shrinks. Every client question is answered.

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

**A "team" is a pair of players and has no name of its own** (client feedback): each
player has a name and a logo, and on air a team is drawn as two logos side by side
with the two names stacked ([Pair.jsx](src/components/Pair.jsx)). There are no
points and no seeds anywhere.

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
| Bracket | `#/source/bracket` | Semis → Final, then the Winners box. Transparent. |

Stacking, bottom to top: **background → (cameras) → graphic**. Each scene gets its own
copy of the background; copies stay in step (see below), so cuts are seamless.

Caster cameras go **below** `caster-webcams`, at x 120 / x 1000, y 280, 800×450. If a
camera is not 16:9, use Edit Transform → "Scale to outer bounds" at 800×450 with
"Crop to Bounding Box". **No OBS mask is needed** for the rounded corners: the frame's
two solid rings (6px cream, 6px blue, drawn outside the window) cover the camera's
square corners, and a few pixels of misalignment on any edge.

## Deploying

The live site is https://fourcourtjester.github.io/SS-Mercy-Riftbound-2v2/ (board at
`#/`, graphics at `#/source/<name>`), built and published by
[.github/workflows/pages.yml](.github/workflows/pages.yml) on every push to `main`.

**Pages' source must be "GitHub Actions"**, not "Deploy from a branch". On branch
deploys GitHub runs its own `pages-build-deployment` *after* our workflow and replaces
the built site with the raw repo, whose `index.html` loads `/src/main.jsx` — a blank
page. Both runs report success, so nothing looks wrong. Check with
`gh api repos/FourCourtJester/SS-Mercy-Riftbound-2v2/pages --jq .build_type` (want
`workflow`). The CDN caches for 10 minutes; add `?v=<anything>` to see a deploy
immediately.

## Data

Everything is under `variables` unless noted. Shape and ranking live in
[src/components/tournament.js](src/components/tournament.js), shared by graphics,
board and mutations so they never disagree about who is first.

| Path | What |
|---|---|
| `slate.message` | Slate text. Fallback "Starting Soon". |
| `timers.slate` | The slate countdown (a `timers` path, not `variables`). |
| `casters.{1,2}.name` / `.handle` | Name plates. Handle optional. |
| `casters.message` | Bar under the cameras; empty hides it. Two lines at most (see FitLines). |
| `standings.title` / `.note` / `.a` / `.b` / `.logos` | Headings, footer (empty hides it), group names, `'hidden'` hides logos. |
| `groups.{a,b}.{1-4}.{p1,p2}.name` / `.logo` | A team's two players, at a fixed slot. Logos optional. |
| `groups.{a,b}.{1-4}.w` / `.l` / `.tb` | Results. Counters (Stepper writes increments). |
| `bracket.title` / `.logos` | Heading, `'hidden'` hides logos. |
| `bracket.{sf1,sf2,final}.{top,bottom}.team` | Which team: a group slot key, `a1`–`b4`. **A reference, not a copy** — the players and their logos are looked up in `groups` on the way to air, so the bracket can never drift from the groups. |
| `bracket.{sf1,sf2,final}.{top,bottom}.score` | The score. |
| `bracket.{sf1,sf2,final}.winner` | `'top'` or `'bottom'`. |

**Ranking:** wins, then fewest losses, then `tb` (tiebreak — board only, never on
air), then slot order. Teams level on all three share a rank. W is the emphasised
column on air. **Confirmed with the client:** teams that tie play a tiebreak, and
whoever wins it moves on — the operator gives them +1 Tiebreak (a three-way tie
takes 2 / 1 / 0). Until a group has any result, ranks are 1–4 in
slot order.

**Advancing** (the highlight) means *through*: in the top two and not level with the
team in 3rd. A tie across the cut marks neither team until a result or a tiebreak
separates them (one team with the only win: one team through, three unmarked, all
reading "2"). `bracket:fill` fills by position, so with a tie across the cut it falls
back to slot order — set a tiebreak first.

**Mutations** ([src/mutations/tournament.js](src/mutations/tournament.js)):
`groups:reset` (zero W/L/TB, keep players), `bracket:fill` ("Fill from standings":
semis from current standings — writes team keys, clears all scores/results),
`bracket:winner { match, side }` (toggle; a semi's winner's team key goes into the
final, Semi 1 → top, Semi 2 → bottom; changing a semi clears a final the old winner
had won), `bracket:reset`.

**The fill is confirmed correct** (A1 v B2, B1 v A2). The escape hatch stays anyway,
by the producer's decision: every bracket slot is a dropdown of all eight teams
("A1 · Nova & Orbit"), so any pairing can be set by hand without breaking the link
to the groups. Do not remove it.

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
  font's width axis 125% → 75%, then `scaleX` with no floor. Player names and the
  group-name stickers use it. On the standings a player name gets ~274px at 36px
  with logos shown (~454px hidden: 800 less rank 92, logos 160, W 96, L 76, four
  20px gaps and 22px padding); "Interstellarwanderer" (20 characters) narrows but
  reads.
- [Pair.jsx](src/components/Pair.jsx) — `PairLogos` (two circles side by side —
  player logos are round; the square box clips to the circle, so whitespace corners
  in an image disappear; an empty one keeps its place with a faint star) and
  `PairNames` (two fitted lines; a pair with nobody named shows one dimmed
  placeholder, one missing name shows "TBD"). Standings (76px logos, 36px names),
  bracket (64 / 30) and the Winners box (84 / 40) all use them.
- The bracket's **Winners** box sits under the Final with the winning pair's logos
  and names, and appears only once a final winner is marked. It is centred in the
  space between the Final and the bottom of the screen by a box filling that space.
- Group-name stickers hug a short name and stop at 562px — what the W / L labels
  leave — then fit. A content-sized box with a `max-w` works with Fitted;
  core's `<Variable fit>` does not, because it measures against the first ancestor
  whose width does not depend on the text, which here is the whole 800px row.
- [FitLines](src/components/FitLines.jsx) — wraps, but steps the font down to stay
  within N lines. By default it stops at `min` and wraps further rather than shrink
  into unreadable — the slate (76 → 52px; a 63-character message ends on four lines
  at 52). With `strict` it keeps shrinking past `min` (to a 12px floor) instead, for
  a box that cannot take another line — the caster message bar (two lines, 44 →
  28px, then smaller).
- The caster message bar is centred on y 966 by a band around it, so a second line
  grows it evenly up and down. Its corners are a fixed 48px radius, not
  `rounded-full`, so one line is the same pill as before and two lines a rounded
  box. With handles the name plates end at y 890; the bar's top is 20–28px below.
- The slate keeps room for two full lines of message and for the countdown even when
  either is short or off, so changes on air never move the logo.

## The board

- Panels: Slate, Caster webcams, Group standings, Group A, Group B, Bracket, then the
  three matches.
- [Panel](src/control/Panel.jsx) — core `Panel`'s markup plus two things: an
  `actions` slot for header buttons (Reset countdown, Swap casters, Zero all results,
  Fill from standings / Clear bracket; they take `HEADER_BUTTON`), and folding — the
  title is a button that collapses the body, actions stay usable while folded. Every
  panel on this board goes through it.
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
  folds to one line — slot, saved players, record (`A1 · Nova & Orbit · 3–0`) — so a
  folded group still reads at a glance. Open: Player 1 + logo, Player 2 + logo, then
  Wins / Losses / Tiebreak, with dividers between. The
  steppers go two-up via a **container query** on the card (`@2xs:grid-cols-2`),
  since card width depends on how many share the line, not on the window.
- Bracket: matches stack at md and go 3 across from lg (a third of the board at md is
  ~200px — too narrow for a stepper and anything beside it). Each team is one `Row`:
  team dropdown, score, result — `md` 6/4/2 on one line, `lg` 12 then 8/4.
- [Divider](src/control/Divider.jsx) — an `<hr>` between groups of controls (Slate,
  Caster webcams, Group standings, and inside each team card). Core's `Break` is
  deprecated and draws nothing.
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
  relative to the prefix (`'a.1.p1.name'`), counters included.
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
   sudo needed: `apt-get download libnspr4 libnss3 libasound2` (this is Ubuntu 22.04;
   on 24.04 and later the last is `libasound2t64`, and `apt-get download` fails
   outright if any name is wrong), `dpkg-deb -x` each into a folder, and run with
   `LD_LIBRARY_PATH` pointing at its `usr/lib/x86_64-linux-gnu` and
   `usr/lib/x86_64-linux-gnu/nss`. The browser itself survives in
   `~/.cache/ms-playwright`; match it with `playwright@1.56.1`.
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
7. **Go via `about:blank` after a composite.** `setContent` keeps the page's URL, so a
   following `goto` to the same address (or one differing only after `#`) is a
   same-document hash change: the app never starts and `window.__port` never
   appears.
8. **Folded controls are still in the page, hidden.** A label on one team card
   matches on all eight; count only visible ones, or open the card and screenshot
   it, rather than expecting exactly one match.
9. **Logos in tests:** any file in `public/` works as a logo value
   (`'./brand/mercy.png'`). The board's logo picker then shows the path in orange,
   because it expects images from its library; that's expected with test data.
10. Test scripts are not kept in the repo. The steps above are enough to rebuild them
    in a few minutes.

## Releasing

How v1.0 and v1.1 went out; do the same next time, once the producer asks.

1. Branch off an up-to-date `main` (`release/vX.Y`, or `docs/…` for docs only), one
   commit with a message that says what changed and why, then a PR whose
   description covers what changed, how it was checked, and anything left open.
2. There are **no PR checks**: the only workflow is the Pages deploy, which runs on
   pushes to `main`. The stand-in is a fresh clone of the branch, `npm install` and
   `npm run build`.
3. Merge with a merge commit (`gh pr merge <n> --merge`), as #1 and #2 were.
4. Watch the Pages run on `main` (`gh run watch`), then confirm nothing deployed after
   it (`gh run list` should show no `pages-build-deployment`; see Deploying).
5. Load the live board and every graphic with `?v=<anything>` and check for errors
   and missing files, and for something only the new version has.
6. `git switch main && git pull --ff-only` so the working tree matches what's live.

## Answered by the client

- **Tiebreaks:** a tie is settled by a tiebreak; the winner moves on (see Ranking).
- **Bracket:** A1 v B2, B1 v A2 is right. Keep the manual override anyway.
- **Casters:** always two — "today". A solo or three-caster layout would be a new
  variant of `caster-webcams`, if it ever comes up.

Nothing is open with the client.

## For the producer to decide

- `LICENSE` is still the template's Unlicense, which dedicates the repo to the public
  domain. The template suggests deleting it once it is a real show; the README notes
  that the client's brand art is not covered either way. Leave it unless asked.
- `.github/FUNDING.yml` still shows Single Studio's sponsor accounts (the
  producer's own). Leave it unless asked.

## Upstream notes

Studio workarounds that could become Single Studio defaults:

1. An `actions` slot and folding on core `Panel` (folded on load) — then delete
   `src/control/Panel.jsx`.
2. A compact size (e.g. `size="sm"`) on `Confirm`, `ResetButton`, `SwapButton`,
   `Toggle`, so header buttons need no `!` overrides.
3. `color-scheme: dark` on the board in core's `base.css`.
4. A stepper that fills its column, as an option on `Stepper` — then delete
   `src/control/FillStepper.jsx`.
