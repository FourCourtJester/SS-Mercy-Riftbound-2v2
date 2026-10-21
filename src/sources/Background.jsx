import { SpaceBackground } from '../components/SpaceBackground'
import { Stage } from '../components/Stage'

// The animated sky, on its own so it can sit under any composition: the slate,
// the standings, the bracket, or the caster cameras.
// Add to OBS as a Browser source pointed at #/source/background
export default function Background() {
  return (
    <Stage>
      <SpaceBackground />
    </Stage>
  )
}
