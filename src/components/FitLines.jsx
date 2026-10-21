import { useLayoutEffect, useRef } from 'react'

/**
 * Text that wraps, but tries to stay within `lines` lines: it steps its font size
 * down from `max` until it does, and stops at `min` -- past that it wraps onto
 * another line rather than shrinking into something nobody can read.
 *
 * The other half of Fitted, for a message rather than a name: a name has to stay
 * on one line, a sentence is better on two at a size people can read.
 *
 * Measured again whenever its height changes, which covers new text, a resize and
 * the webfont arriving. Settles rather than loops: each pass ends on the size the
 * last one did.
 */
export function FitLines({ lines = 2, max, min, lineHeight = 1.1, className = '', children }) {
  const box = useRef(null)

  useLayoutEffect(() => {
    const element = box.current

    if (!element) return undefined

    const measure = () => {
      for (let size = max; size >= min; size -= 2) {
        element.style.fontSize = `${size}px`
        if (element.scrollHeight <= Math.ceil(size * lineHeight * lines) + 1) return
      }

      element.style.fontSize = `${min}px`
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(element)

    return () => observer.disconnect()
  }, [lines, max, min, lineHeight])

  return (
    <div ref={box} className={className} style={{ lineHeight, fontSize: max }}>
      {children}
    </div>
  )
}
