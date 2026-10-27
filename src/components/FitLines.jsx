import { useLayoutEffect, useRef } from 'react'

/** The smallest a `strict` box goes. Past this, text is not worth putting on air. */
const FLOOR = 12

/**
 * Text that wraps, but tries to stay within `lines` lines: it steps its font size
 * down from `max` until it does, and stops at `min` -- past that it wraps onto
 * another line rather than shrinking into something nobody can read.
 *
 * `strict` is for a box that cannot take another line: past `min` it keeps
 * shrinking, a pixel at a time, rather than wrap. Overlong text gets small, but
 * never spills out of its box onto whatever is next to it.
 *
 * The other half of Fitted, for a message rather than a name: a name has to stay
 * on one line, a sentence is better on two at a size people can read.
 *
 * Measured again whenever its height changes, which covers new text, a resize and
 * the webfont arriving. Settles rather than loops: each pass ends on the size the
 * last one did.
 */
export function FitLines({ lines = 2, max, min, strict = false, lineHeight = 1.1, className = '', children }) {
  const box = useRef(null)

  useLayoutEffect(() => {
    const element = box.current

    if (!element) return undefined

    const fits = (size) => {
      element.style.fontSize = `${size}px`
      return element.scrollHeight <= Math.ceil(size * lineHeight * lines) + 1
    }

    const measure = () => {
      for (let size = max; size >= min; size -= 2) if (fits(size)) return

      if (strict) for (let size = min - 1; size > FLOOR; size -= 1) if (fits(size)) return

      element.style.fontSize = `${strict ? FLOOR : min}px`
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(element)

    return () => observer.disconnect()
  }, [lines, max, min, strict, lineHeight])

  return (
    <div ref={box} className={className} style={{ lineHeight, fontSize: max }}>
      {children}
    </div>
  )
}
