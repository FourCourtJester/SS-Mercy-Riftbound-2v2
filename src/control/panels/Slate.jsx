import { Countdown, CountdownTo, Field, ResetButton, Row } from '@single-studio/core/control'

import { Divider } from '../Divider'
import { HEADER_BUTTON, Panel } from '../Panel'

// The full-screen slate: its message, and the countdown under it. Either clock
// control starts the same timer, so use whichever fits -- "back in 5:00" or
// "live at 19:30". The countdown hides itself on the slate when it is not running.
export default function Slate() {
  return (
    <Panel title="Slate" actions={<ResetButton label="countdown" paths={['timers.slate']} className={HEADER_BUTTON} />}>
      <Field name="slate.message" label="Message" placeholder="Starting Soon" />
      <Divider />
      <Row>
        <Countdown name="slate" label="Countdown for" />
        <CountdownTo name="slate" label="Countdown to" />
      </Row>
    </Panel>
  )
}
