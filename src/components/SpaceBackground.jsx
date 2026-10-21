import { useState } from 'react'

import './space.css'

// The animated backdrop, which is its own browser source (sources/Background.jsx)
// so it can sit under anything in OBS: mercbkg.png, with twinkling stars, drifting
// dust, slow nebula glow and the odd comet over it.
//
// Two things keep a cut between scenes seamless, even when each scene has its own
// copy of the source. The stars are drawn from a fixed seed, so every copy puts them
// in the same places; and every animation's phase comes from the wall clock rather
// than from when the source loaded, so a scene switch lands mid-twinkle exactly
// where the last scene left off.

/** A small seeded PRNG (mulberry32), so every source draws the same sky. */
function seeded(seed) {
  let a = seed

  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const between = (random, min, max) => min + random() * (max - min)

/** A negative delay that puts a looping animation where the wall clock says it is. */
const phase = (now, seconds, offset = 0) => `${-((now / 1000 + offset) % seconds).toFixed(3)}s`

const STARS = (() => {
  const random = seeded(2242)

  return Array.from({ length: 120 }, (_, index) => ({
    id: index,
    x: between(random, 0, 100),
    // Fewer in the bright band along the bottom, where they would not read anyway.
    y: Math.pow(random(), 1.35) * 92,
    size: between(random, 1.2, 3.2),
    low: between(random, 0.1, 0.45),
    seconds: between(random, 2.8, 7.5),
    offset: between(random, 0, 10),
    sparkle: index % 13 === 0,
  }))
})()

/** Dust as one tile of tiny dots, repeated and slid exactly one tile per loop. */
function dust(seed, { width, height, count, size, alpha }) {
  const random = seeded(seed)
  const dots = Array.from({ length: count }, () => {
    const x = between(random, 0, width).toFixed(0)
    const y = between(random, 0, height).toFixed(0)
    const r = between(random, size * 0.5, size).toFixed(2)
    const a = between(random, alpha * 0.4, alpha).toFixed(2)

    return `radial-gradient(circle at ${x}px ${y}px, rgba(214, 228, 255, ${a}) 0, rgba(214, 228, 255, ${a}) ${r}px, transparent ${(r * 1.8).toFixed(2)}px)`
  })

  return { backgroundImage: dots.join(','), backgroundSize: `${width}px ${height}px`, '--tile-w': `${width}px`, '--tile-h': `${height}px` }
}

const DUST = [
  { ...dust(7, { width: 900, height: 450, count: 34, size: 1.1, alpha: 0.55 }), seconds: 160 },
  { ...dust(11, { width: 700, height: 350, count: 16, size: 1.8, alpha: 0.7 }), seconds: 80 },
]

const COMETS = [
  { top: 8, left: -12, angle: 14, seconds: 17, offset: 0 },
  { top: 2, left: 30, angle: 32, seconds: 23, offset: 9 },
  { top: 22, left: -8, angle: 6, seconds: 29, offset: 18 },
]

/**
 * The four brightest stars painted into mercbkg.png, as a percentage of the image,
 * each flaring into a big glint now and then. They sit inside the image's own
 * layer, so they breathe with it and stay on their stars. Periods share no factor,
 * so the flares never fall into a pattern.
 */
const GLINTS = [
  { x: 12.5, y: 9.4, seconds: 23, offset: 4 },
  { x: 69.2, y: 28.2, seconds: 29, offset: 15 },
  { x: 12.5, y: 51.8, seconds: 34, offset: 26 },
  { x: 37.7, y: 59.2, seconds: 41, offset: 9 },
]

/** Mercy's diamond shards, drifting up through the sky and turning as they go. */
const SHARDS = (() => {
  const random = seeded(808)

  return Array.from({ length: 8 }, (_, index) => ({
    id: index,
    // Spread across the width, each in its own eighth, so they never bunch up.
    x: (index + between(random, 0.15, 0.85)) * (100 / 8),
    size: between(random, 26, 46),
    alpha: between(random, 0.6, 0.95),
    // Every other one has a little companion, the way Mercy's art draws them.
    pair: index % 2 === 1,
    rise: between(random, 38, 70),
    sway: between(random, 5, 9),
    reach: between(random, 14, 30),
    offset: between(random, 0, 70),
  }))
})()

const DIAMOND = 'M10 0L17 20L10 40L3 20Z'

/**
 * The gradient and blur every shard shares, defined once. Referenced by id from
 * each shard's own SVG, which works anywhere in the same document.
 */
function ShardDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <linearGradient id="space-shard-core" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfe2ff" />
        </linearGradient>
        <filter id="space-shard-fringe" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
    </svg>
  )
}

/** One diamond: a bright core between a soft orange and a soft blue fringe, as in Mercy's art. */
function Diamond({ transform }) {
  return (
    <g transform={transform}>
      <path d={DIAMOND} fill="#ffb04a" transform="translate(-2.6 -1.4)" filter="url(#space-shard-fringe)" />
      <path d={DIAMOND} fill="#4a8dff" transform="translate(2.6 1.4)" filter="url(#space-shard-fringe)" />
      <path d={DIAMOND} fill="url(#space-shard-core)" />
      <path d="M10 0L10 40L3 20Z" fill="#ffffff" />
    </g>
  )
}

function Shard({ pair }) {
  return (
    <svg viewBox="-8 -8 40 72" className="space-shard-art" aria-hidden="true">
      <Diamond />
      {pair ? <Diamond transform="translate(15 34) scale(0.5)" /> : null}
    </svg>
  )
}

export function SpaceBackground() {
  // Read once on mount: the phase only has to be right when the source appears.
  const [now] = useState(() => Date.now())

  return (
    <div className="space">
      <div className="space-base" style={{ backgroundImage: 'url(./mercbkg.png)', animationDelay: phase(now, 90) }}>
        {GLINTS.map((glint, index) => (
          <span
            key={index}
            className="space-glint"
            style={{ left: `${glint.x}%`, top: `${glint.y}%`, animationDuration: `${glint.seconds}s`, animationDelay: phase(now, glint.seconds, glint.offset) }}
          />
        ))}
      </div>
      <div className="space-nebula space-nebula-a" style={{ animationDelay: phase(now, 70) }} />
      <div className="space-nebula space-nebula-b" style={{ animationDelay: phase(now, 95) }} />

      {DUST.map(({ seconds, ...style }, index) => (
        <div key={index} className="space-dust" style={{ ...style, animationDuration: `${seconds}s`, animationDelay: phase(now, seconds) }} />
      ))}

      {STARS.map((star) => (
        <span
          key={star.id}
          className={star.sparkle ? 'space-star space-sparkle' : 'space-star'}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.sparkle ? star.size * 7 : star.size,
            height: star.sparkle ? star.size * 7 : star.size,
            '--low': star.low,
            animationDuration: `${star.seconds}s`,
            animationDelay: phase(now, star.seconds, star.offset),
          }}
        />
      ))}

      <ShardDefs />
      {SHARDS.map((shard) => (
        <div
          key={shard.id}
          className="space-shard"
          style={{
            left: `${shard.x}%`,
            '--alpha': shard.alpha.toFixed(2),
            animationDuration: `${shard.rise}s`,
            animationDelay: phase(now, shard.rise, shard.offset),
          }}
        >
          {/* An alternating loop repeats every two runs, so its phase is taken over both. */}
          <div
            className="space-shard-sway"
            style={{ width: shard.size, '--reach': `${shard.reach}px`, animationDuration: `${shard.sway}s`, animationDelay: phase(now, shard.sway * 2, shard.offset) }}
          >
            <Shard pair={shard.pair} />
          </div>
        </div>
      ))}

      {COMETS.map((comet, index) => (
        <div key={index} className="space-comet-track" style={{ top: `${comet.top}%`, left: `${comet.left}%`, transform: `rotate(${comet.angle}deg)` }}>
          <div className="space-comet" style={{ animationDuration: `${comet.seconds}s`, animationDelay: phase(now, comet.seconds, comet.offset) }} />
        </div>
      ))}

      <div className="space-vignette" />
    </div>
  )
}
