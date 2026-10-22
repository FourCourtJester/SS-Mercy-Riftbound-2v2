# Mercy's 2v2 Invitational

Broadcast graphics for **Mercy's 2v2 Invitational**, a Riftbound tournament presented
by Syncd. An operator's board runs as a dock inside OBS, and each graphic is its own
browser source. Built on [Single Studio](https://fourcourtjester.github.io/Single-Studio/).

**Format:** two groups of four pairs play a round robin. The top two of each group go
to a single-elimination bracket: Semifinal 1 is A1 v B2, Semifinal 2 is B1 v A2, then
the Final.

## Live

The board: **https://fourcourtjester.github.io/SS-Mercy-Riftbound-2v2/#/**

Every push to `main` deploys here. The graphics are the same address with
`#/source/<name>`, and the board's header menu lists each one with a copy button.

| Graphic | Source | What it shows |
|---|---|---|
| Background | `#/source/background` | The animated sky: stars, dust, comets, glints and Mercy's drifting shards. Goes under everything. |
| Slate | `#/source/slate` | Mercy, the logo, a message and an optional countdown. |
| Caster webcams | `#/source/caster-webcams` | Frames and name plates for two caster cameras, plus a message bar. |
| Group standings | `#/source/group-standings` | Both groups, ranked, with the teams going through highlighted. |
| Bracket | `#/source/bracket` | Semifinals into the Final, and the Winners once the Final is decided. |

## Setting up OBS

1. **Add the board as a dock:** Docks → Custom Browser Docks, pointing at the board URL.
   Run the board here rather than in a separate browser: show data is saved in the
   browser that runs the board, and OBS's browser sources only see what's typed into
   OBS's own dock.
2. **Add each graphic as a Browser source** at **1920×1080**.
3. **Stack each scene bottom to top:** the background, then any cameras, then the
   graphic. Every graphic except the background is transparent. Give each scene its
   own background source; the copies stay in step, so cuts between scenes are
   seamless.
4. **Caster cameras** go *below* `caster-webcams`, at x 120 and x 1000, y 280,
   800×450 each (Edit Transform takes these numbers directly). No mask is needed: the
   frames cover the cameras' corners. If a camera isn't 16:9, set Bounding Box Type
   to "Scale to outer bounds" at 800×450 and tick "Crop to Bounding Box".

## Running the show

Every panel on the board starts folded; click a title to open it. Typing is held
until you save (Ctrl+S or the save button); buttons act straight away.

- **Groups:** each team is two players, each with a name and an optional logo, picked
  from the image library in the board's header. Logos show as circles. Record wins and
  losses as matches finish, and the standings re-rank themselves.
- **Ties:** tied teams play a tiebreak. Give the winner +1 Tiebreak and they move
  ahead. Tiebreak never appears on air.
- **Bracket:** press **Fill from standings** once the groups are done. Mark each match
  with **Won**; semifinal winners move into the Final, and the Final's winners appear
  in the Winners box. Every slot is also a dropdown, if a pairing ever needs setting
  by hand.

## Development

```bash
npm install
npm run dev      # the board at the printed URL
npm run build
```

Or open the repo in its **devcontainer** (Node 24): VS Code → "Dev Containers: Reopen
in Container".

| Path | What it is |
|---|---|
| `src/sources/` | One file per graphic; each becomes a browser source. |
| `src/control/` | The operator's board: `Control.jsx` composes `panels/`. |
| `src/components/` | Shared pieces: the sky, the pair of logos and names, text fitting, and the tournament rules in `tournament.js`. |
| `src/mutations/` | How the show's data changes: fill the bracket, mark a winner, reset. |
| `public/` | Brand art, and `brand/` copies trimmed to their edges by `scripts/trim-png.mjs`. |

**[CLAUDE.md](CLAUDE.md) is the full picture:** the data paths, the design system,
decisions made with the client, gotchas, and how changes are checked (there's no
test suite; every graphic is screenshotted at 1920×1080). The framework's own rules
are in [AGENTS.md](AGENTS.md).

**Deploying:** Pages' source must be **GitHub Actions** (Settings → Pages → Source),
not "Deploy from a branch". On the branch setting, GitHub replaces the built site with
the raw repository a few seconds after our deploy, and the site goes blank.

## Brand art

The Mercy's 2v2 Invitational logo, the Mercy mascot and the sky background
(`public/mercbkg.png`, `public/2v2InviteText.png`, `public/Mercy.png` and their
copies in `public/brand/`) belong to the event and its organisers. They are here to
run this broadcast and are not covered by this repository's licence.
