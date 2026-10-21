import Bracket from './panels/Bracket'
import Casters from './panels/Casters'
import Groups from './panels/Groups'
import Slate from './panels/Slate'

// The operator's board: which panels it has, and in what order.
//
// Panels live in ./panels, one per file. Add one there and list it here.
//
// Buttons write immediately. Anything you type stages until you save, so a
// half-typed name never reaches air -- the save button and Ctrl+S are already on the
// page, alongside the image store and the browser-source URLs to paste into OBS.
//
// The order follows the show: slate before the stream, casters, then the group
// stage, then the bracket.
export default function Control() {
  return (
    <>
      <Slate />
      <Casters />
      <Groups />
      <Bracket />
    </>
  )
}
