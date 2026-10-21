import { useLayoutEffect, useRef } from 'react'

/** Widths of the display face to try, widest first. Archivo runs 62% to 125%. */
const STRETCHES = ['125%', '112%', '100%', '88%', '75%']

/**
 * One line of text, made to fit its box rather than wrapping or clipping.
 *
 * For text a graphic works out itself -- a ranked team's name -- where there is no
 * `<Variable fit>` to reach for. It narrows the typeface's own width axis first,
 * which keeps the letters looking like the font, and only squeezes past its
 * narrowest. Measured again whenever the text's natural width changes, which
 * includes the moment the webfont replaces the fallback.
 */
export function Fitted({ text }) {
  const box = useRef(null)
  const inner = useRef(null)

  useLayoutEffect(() => {
    const outer = box.current
    const span = inner.current

    if (!outer || !span) return undefined

    const measure = () => {
      span.style.transform = ''

      for (const stretch of STRETCHES) {
        span.style.fontStretch = stretch
        if (span.offsetWidth <= outer.clientWidth) return
      }

      span.style.transform = `scaleX(${outer.clientWidth / span.offsetWidth})`
    }

    measure()

    // Settles rather than loops: each pass ends on the width the last one did.
    const observer = new ResizeObserver(measure)
    observer.observe(span)
    observer.observe(outer)

    return () => observer.disconnect()
  }, [text])

  return (
    <div ref={box} className="w-full overflow-hidden whitespace-nowrap">
      <span ref={inner} className="inline-block origin-left">
        {text}
      </span>
    </div>
  )
}
