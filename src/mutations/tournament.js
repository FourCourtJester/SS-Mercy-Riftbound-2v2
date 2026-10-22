import { FEEDS, GROUPS, MATCHES, SLOTS, standings, teamKey } from '../components/tournament'

// The group stage and the bracket. See src/components/tournament.js for the shape.

/** Every path under a prefix, cleared. */
const clearing = (ctx, prefix) => Object.keys(ctx.collect(prefix)).map((key) => [`${prefix}.${key}`, undefined])

export const tournament = {
  /** Zero every team's wins, losses and tiebreak. Players and logos stay. */
  'groups:reset'(ctx) {
    ctx.write(GROUPS.flatMap((group) => SLOTS.flatMap((slot) => ['w', 'l', 'tb'].map((field) => [`variables.groups.${group}.${slot}.${field}`, undefined]))))
  },

  /**
   * Fill the semi-finals from the group standings as they stand: A1 v B2 and
   * B1 v A2. Clears every score and result, since this is a fresh bracket.
   *
   * A guess at the format, not a rule: every slot it fills can be changed on the
   * board. It writes which team, not the team's details, so names and logos keep
   * following the groups afterwards.
   */
  'bracket:fill'(ctx) {
    const ranked = standings(ctx.collect('variables.groups'))
    const place = (slot, group, position) => [`variables.bracket.${slot}.team`, teamKey(ranked[group][position - 1])]

    ctx.write([
      ...MATCHES.flatMap((match) => clearing(ctx, `variables.bracket.${match}`)),
      place('sf1.top', 'a', 1),
      place('sf1.bottom', 'b', 2),
      place('sf2.top', 'b', 1),
      place('sf2.bottom', 'a', 2),
    ])
  },

  /**
   * Mark a match's winner. `mutate('bracket:winner', { match: 'sf1', side: 'top' })`
   *
   * Pressing the side that already won takes the result back. A semi's winner is
   * carried into the final -- Semi 1 fills the top slot, Semi 2 the bottom -- and
   * changing a semi's result clears a final that the old winner had already won.
   */
  'bracket:winner'(ctx, { match, side }) {
    const base = `variables.bracket.${match}`
    const next = ctx.read(`${base}.winner`) === side ? undefined : side
    const writes = [[`${base}.winner`, next]]
    const slot = FEEDS[match]

    if (slot) {
      const target = `variables.bracket.final.${slot}`

      writes.push([`${target}.team`, next ? ctx.read(`${base}.${next}.team`) : undefined])
      writes.push([`${target}.score`, undefined])

      if (ctx.read('variables.bracket.final.winner') === slot) writes.push(['variables.bracket.final.winner', undefined])
    }

    ctx.write(writes)
  },

  /** Empty the bracket. The heading and the logo setting stay. */
  'bracket:reset'(ctx) {
    ctx.write(MATCHES.flatMap((match) => clearing(ctx, `variables.bracket.${match}`)))
  },
}
