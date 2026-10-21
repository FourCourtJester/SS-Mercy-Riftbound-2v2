import { useState } from 'react'

/**
 * Whether something on the board is folded away. Panels use it, and so do the team
 * cards inside them.
 *
 * Everything starts folded, on every load: a fresh board is a short list of panel
 * headers, and an operator opens what the next segment needs. Folded panels keep
 * their header actions, and folded team cards keep a one-line summary, so folding
 * hides the controls, not the state of the show.
 *
 * Component state only -- not the show's store, where it would fold things on
 * everybody else's board, and not browser storage, so a reload is always the same
 * board. `initial` opens one by default.
 */
export function useCollapsed(initial = true) {
  const [collapsed, setCollapsed] = useState(initial)

  return [collapsed, () => setCollapsed((was) => !was)]
}

/** Points down when open, right when folded. */
export function Chevron({ collapsed }) {
  return (
    <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 shrink-0 transition-transform ${collapsed ? '-rotate-90' : ''}`} aria-hidden="true">
      <path d="M3.5 6 8 10.5 12.5 6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
