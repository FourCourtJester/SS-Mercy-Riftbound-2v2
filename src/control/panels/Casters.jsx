import { Field, Row, SwapButton } from '@single-studio/core/control'

import { Divider } from '../Divider'
import { HEADER_BUTTON, Panel } from '../Panel'

// The caster webcam slate. The message bar hides itself when the message is empty.
export default function Casters() {
  return (
    <Panel
      title="Caster webcams"
      actions={
        <SwapButton
          label="Swap casters"
          names={['casters.1.name', 'casters.1.handle', 'casters.2.name', 'casters.2.handle']}
          className={HEADER_BUTTON}
        />
      }
    >
      <Caster number={1} />
      <Divider />
      <Caster number={2} />
      <Divider />
      <Field name="casters.message" label="Message" placeholder="Shown under the cameras; empty hides it" />
    </Panel>
  )
}

function Caster({ number }) {
  return (
    <Row>
      <Field name={`casters.${number}.name`} label={`Caster ${number}`} placeholder="Name" />
      <Field name={`casters.${number}.handle`} label="Handle" placeholder="@handle (optional)" />
    </Row>
  )
}
