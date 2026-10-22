import { Image } from '@single-studio/core/source'

import { Twinkle } from './Brand'
import { Fitted } from './Fitted'

// A team on air is a pair of players: their two logos side by side, and their two
// names stacked. The standings, the bracket and the winners box all draw it with
// these, at their own sizes.

/**
 * The two players' logos, side by side, each in a circle: player logos are round.
 * The box is square and clips to the circle, so a square image with whitespace
 * around a round logo loses its corners rather than showing them. An empty one keeps
 * its place with a faint star, so a pair with one logo still lines up with its
 * neighbours.
 *
 * @param {object} props
 * @param {Array<{ logo?: string }>} props.players
 * @param {number} props.size - Each box, in pixels.
 * @param {string} [props.className] - The boxes' own look: border, background.
 */
export function PairLogos({ players, size, className = '' }) {
  return (
    <div className="flex shrink-0 gap-2">
      {players.map((player, index) => (
        <div
          key={index}
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full p-1 ${className}`}
          style={{ width: size, height: size }}
        >
          {player.logo ? (
            <Image value={player.logo} className="flex h-full w-full items-center justify-center" />
          ) : (
            <Twinkle className="h-[40%] w-[40%] opacity-25" />
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * The two players' names, one to a line, each fitted to the width it has.
 *
 * A pair with nobody named yet shows `empty` once, dimmed, rather than two lines of
 * it. A pair with one name shows "TBD" for the other.
 *
 * @param {object} props
 * @param {Array<{ name?: string }>} props.players
 * @param {number} props.size - Font size of each line, in pixels.
 * @param {string} [props.empty] - What stands in for an unnamed pair.
 * @param {string} [props.dim] - The class an unnamed line takes.
 */
export function PairNames({ players, size, empty = 'TBD', dim = 'opacity-40' }) {
  const named = players.some((player) => player.name)
  const lines = named ? players.map((player) => player.name) : [undefined]

  return (
    <div className="min-w-0 flex-1">
      {lines.map((name, index) => (
        <div key={index} className={`type-display ${name ? '' : dim}`} style={{ fontSize: size, lineHeight: 1.08 }}>
          <Fitted text={name || (named ? 'TBD' : empty)} />
        </div>
      ))}
    </div>
  )
}
