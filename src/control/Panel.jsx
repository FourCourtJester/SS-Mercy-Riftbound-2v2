import { useId } from 'react'

import { Chevron, useCollapsed } from './collapse'

/**
 * Sizes a framework button down for a panel header. `!` because the buttons carry
 * their own padding and minimum height, and two utilities for one property are
 * settled by stylesheet order rather than by which was written last.
 */
export const HEADER_BUTTON = 'min-h-0! px-2.5! py-1! text-xs!'

/**
 * The framework's Panel, with two things it does not have yet:
 *
 * - `actions`: buttons that act on the whole panel -- swap, reset, seed -- on the
 *   right of the heading rather than taking a line of the body.
 * - Folding: the title is a button that collapses the body. Actions stay in the
 *   header, so they work with the panel folded. Every panel starts folded on load.
 *
 * The markup mirrors the stock Panel (same classes, same spacing), so everything the
 * board's stylesheet does to `.ss-panel` and `.ss-panel-body` still applies.
 */
export function Panel({ title, actions, children, className = '', ...rest }) {
  const [collapsed, toggle] = useCollapsed()
  const body = useId()

  return (
    <section className={`ss-panel rounded-lg border border-slate-800 bg-slate-900/40 p-3 sm:p-4 ${className}`} {...rest}>
      <header className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-2 ${collapsed ? '' : 'mb-3'}`}>
        <h2>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-controls={body}
            className="-m-1 flex items-center gap-2 rounded p-1 text-sm font-semibold tracking-wide text-slate-400 uppercase transition-colors hover:text-slate-200"
          >
            <Chevron collapsed={collapsed} />
            {title}
          </button>
        </h2>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      {/* The class as well as the attribute: the body's own `display: flex` would
          otherwise win over `hidden`. */}
      <div id={body} className={`ss-panel-body ${collapsed ? 'hidden' : ''}`} hidden={collapsed}>
        {children}
      </div>
    </section>
  )
}
