// The shape of the event, shared by the graphics, the board and the mutations so
// the three can never disagree about who is first.
//
// Two pools of four play a round robin; the top two of each go to a four-team
// single-elimination bracket. Every team lives at a fixed slot:
//
//   variables.groups.a.1.name     team name
//   variables.groups.a.1.players  "Player & Player", optional
//   variables.groups.a.1.logo     an image URL or asset:<key>, optional
//   variables.groups.a.1.w / .l / .pts
//   variables.groups.a.1.tb       tiebreak, board only: higher wins a dead heat
//
// Slots are where an operator typed a team, not where it ranks. Ranking is worked
// out on the way to air.
//
// The bracket does not copy teams; it points at them, so a name or logo fixed in the
// groups is fixed on the bracket at the same moment:
//
//   variables.bracket.sf1.top.team   which team: a group slot key, 'a1' to 'b4'
//   variables.bracket.sf1.top.seed   the label on air, 'A1' -- where they finished,
//                                    fixed when seeded, editable by hand
//   variables.bracket.sf1.top.score
//   variables.bracket.sf1.winner     'top' or 'bottom'

export const GROUPS = ['a', 'b']
export const SLOTS = ['1', '2', '3', '4']

/** How many of each group go through to the bracket. */
export const ADVANCE = 2

/** What a bracket slot carries from one match to the next. Score and winner stay behind. */
export const BRACKET_FIELDS = ['team', 'seed']

/** The bracket's three matches, and which final slot each semi's winner fills. */
export const MATCHES = ['sf1', 'sf2', 'final']
export const FEEDS = { sf1: 'top', sf2: 'bottom' }

const count = (value) => Number(value) || 0

/**
 * The flat collection under `variables.groups` -- `{ 'a.1.name': 'Comets', ... }` --
 * as each group's teams in slot order.
 */
export function teamsFrom(flat = {}) {
  return Object.fromEntries(
    GROUPS.map((group) => [
      group,
      SLOTS.map((slot) => {
        const read = (field) => flat[`${group}.${slot}.${field}`]

        return {
          group,
          slot,
          name: read('name'),
          players: read('players'),
          logo: read('logo'),
          w: count(read('w')),
          l: count(read('l')),
          pts: count(read('pts')),
          tb: count(read('tb')),
        }
      }),
    ]),
  )
}

/**
 * Most points, then most wins, then fewest losses, then the operator's tiebreak --
 * head-to-head, game difference, whatever the event rules say. Nothing left to
 * separate two teams keeps slot order.
 */
const compare = (a, b) => b.pts - a.pts || b.w - a.w || a.l - b.l || b.tb - a.tb || Number(a.slot) - Number(b.slot)

const level = (a, b) => a.pts === b.pts && a.w === b.w && a.l === b.l && a.tb === b.tb

/**
 * One group, best first. Each team gets a `rank`, shared with anyone it is level
 * with, so two teams on the same record both read 2nd rather than 2nd and 3rd.
 *
 * `advancing` means through, not merely placed: one of the top `ADVANCE`, and not
 * level with the first team below the cut. Two teams tied across the line are both
 * unmarked until a result or a tiebreak separates them -- a 1-0-0-0 group has one
 * team through, not two.
 *
 * Until the group has a result in it every team is level, so the ranks are simply
 * 1 to 4 in slot order (and the rule above marks nobody).
 */
export function rank(teams) {
  const sorted = [...teams].sort(compare)
  const started = teams.some((team) => team.w || team.l || team.pts || team.tb)
  const below = sorted[ADVANCE]

  return sorted.map((team, index) => ({
    ...team,
    rank: started ? sorted.findIndex((other) => level(other, team)) + 1 : index + 1,
    position: index + 1,
    advancing: index < ADVANCE && !(below && level(team, below)),
  }))
}

/** Every group ranked: `{ a: [...], b: [...] }`. */
export const standings = (flat) => Object.fromEntries(Object.entries(teamsFrom(flat)).map(([group, teams]) => [group, rank(teams)]))

/** A team's key, as a bracket slot stores it: group A, slot 1 is `a1`. */
export const teamKey = (team) => `${team.group}${team.slot}`

/** Every team by key -- `{ a1: {...}, ... b4: {...} }` -- for resolving bracket slots. */
export const teamIndex = (flat) =>
  Object.fromEntries(
    Object.values(teamsFrom(flat))
      .flat()
      .map((team) => [teamKey(team), team]),
  )
