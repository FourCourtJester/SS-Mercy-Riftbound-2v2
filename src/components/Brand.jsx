// The two pieces of art the invitational supplied, trimmed to their edges in
// public/brand so they can be sized by what is visible rather than by padding.

/** "mercy's 2v2 invitational, presented by Syncd". 1411x616. */
export function Logo({ className = '', style }) {
  return <img src="./brand/logo.png" alt="Mercy's 2v2 Invitational" className={className} style={style} draggable={false} />
}

/** Mercy, the mascot. 1077x1174. */
export function Mercy({ className = '', style }) {
  return <img src="./brand/mercy.png" alt="" className={className} style={style} draggable={false} />
}

/** A small four-point star, for empty logo slots and flourishes. */
export function Twinkle({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 0c.9 6.4 5.6 11.1 12 12-6.4.9-11.1 5.6-12 12-.9-6.4-5.6-11.1-12-12C6.4 11.1 11.1 6.4 12 0Z" fill="currentColor" />
    </svg>
  )
}
