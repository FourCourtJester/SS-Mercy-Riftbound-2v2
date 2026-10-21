import { useEffect, useState } from 'react'
import { Scene } from '@single-studio/core/source'

import '@fontsource-variable/archivo/wdth.css'

/** What every graphic is drawn at. OBS runs the sources at this size. */
export const WIDTH = 1920
export const HEIGHT = 1080

const fit = () => Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT)

/**
 * A 1920x1080 canvas, scaled to whatever the browser source is.
 *
 * Every graphic here is laid out in broadcast pixels, so a preview in a narrow
 * browser tab is the same picture as the one on air, only smaller. In OBS at
 * 1920x1080 the scale is exactly 1.
 */
export function Stage({ children, className = '' }) {
  const [scale, setScale] = useState(fit)

  useEffect(() => {
    const resize = () => setScale(fit())

    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <Scene>
      <div
        className={`absolute top-1/2 left-1/2 overflow-hidden font-display text-merc-cream ${className}`}
        style={{ width: WIDTH, height: HEIGHT, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </Scene>
  )
}
