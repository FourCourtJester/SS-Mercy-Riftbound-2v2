import { useId } from 'react'
import { useVelcroMutate, useVelcroValue } from '@single-studio/core'
import { Confirm, Field, ImagePicker, Row, Select } from '@single-studio/core/control'

import { GROUPS, SLOTS } from '../../components/tournament'
import { Chevron, useCollapsed } from '../collapse'
import { Divider } from '../Divider'
import { FillStepper } from '../FillStepper'
import { HEADER_BUTTON, Panel } from '../Panel'

// The group stage. A team is a pair of players, typed into a fixed slot; the
// graphic ranks them by wins, then fewest losses, so nobody has to reorder anything.
//
// Tiebreak never goes on air. Two teams level on wins and losses show the same rank
// until somebody gives one of them the higher tiebreak.
export default function Groups() {
  const mutate = useVelcroMutate()

  return (
    <>
      <Panel
        title="Group standings"
        actions={
          <Confirm
            label="Zero all results"
            tone="warn"
            ask="Zero every win, loss and tiebreak?"
            onConfirm={() => mutate('groups:reset')}
            className={HEADER_BUTTON}
          />
        }
      >
        <Row>
          <Field name="standings.title" label="Heading" placeholder="Group Stage" />
          <Field name="standings.note" label="Footer" placeholder="Shown under the groups; empty hides it" />
        </Row>
        <Divider />
        <Row>
          <Field name="standings.a" label="Group A name" placeholder="Group A" />
          <Field name="standings.b" label="Group B name" placeholder="Group B" />
        </Row>
        <Divider />
        <Select name="standings.logos" label="Player logos" placeholder="Shown" options={[{ label: 'Hidden', value: 'hidden' }]} />
      </Panel>

      {GROUPS.map((group) => (
        <Panel key={group} title={`Group ${group.toUpperCase()}`}>
          {/* One card per team, top to bottom: two side by side from md, the whole
              group from lg. */}
          <div className="grid items-start gap-3 md:grid-cols-2 lg:grid-cols-4">
            {SLOTS.map((slot) => (
              <Team key={slot} group={group} slot={slot} />
            ))}
          </div>
        </Panel>
      ))}
    </>
  )
}

/**
 * One team -- a pair of players -- as a card, alternating shades with its
 * neighbours, that folds down to one line: slot, players and record, so a folded
 * group still reads at a glance. The line shows what is saved -- an unsaved name
 * appears once it is.
 *
 * The results go two to a line when the card is wide enough for two steppers --
 * measured on the card itself, with a container query, since how wide a card is
 * depends on how many share the line rather than on the window.
 */
function Team({ group, slot }) {
  const path = `groups.${group}.${slot}`
  const label = `${group.toUpperCase()}${slot}`
  const [collapsed, toggle] = useCollapsed()
  const body = useId()

  const p1 = useVelcroValue(`variables.${path}.p1.name`)
  const p2 = useVelcroValue(`variables.${path}.p2.name`)
  const w = useVelcroValue(`variables.${path}.w`, 0)
  const l = useVelcroValue(`variables.${path}.l`, 0)
  const pair = [p1, p2].filter(Boolean).join(' & ')

  return (
    <div className="@container flex min-w-0 flex-col gap-3 rounded-md border border-slate-800 p-3 odd:bg-slate-950/60 even:bg-slate-800/60">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={!collapsed}
        aria-controls={body}
        className="-m-1 flex min-w-0 items-center gap-2 rounded p-1 text-left text-sm transition-colors hover:text-slate-100"
      >
        <Chevron collapsed={collapsed} />
        <span className="shrink-0 font-semibold tracking-wide text-slate-400">{label}</span>
        <span className={`min-w-0 flex-1 truncate ${pair ? 'text-slate-200' : 'text-slate-500 italic'}`}>{pair || 'No players yet'}</span>
        <span className="shrink-0 text-xs text-slate-400 tabular-nums">
          {w}–{l}
        </span>
      </button>

      <div id={body} className={`flex flex-col gap-3 ${collapsed ? 'hidden' : ''}`} hidden={collapsed}>
        <Field name={`${path}.p1.name`} label="Player 1" placeholder="Name" />
        <ImagePicker name={`${path}.p1.logo`} label="Player 1 logo" />
        <Divider />
        <Field name={`${path}.p2.name`} label="Player 2" placeholder="Name" />
        <ImagePicker name={`${path}.p2.logo`} label="Player 2 logo" />
        <Divider />
        <div className="grid gap-3 @2xs:grid-cols-2">
          <FillStepper name={`${path}.w`} label="Wins" />
          <FillStepper name={`${path}.l`} label="Losses" />
          <FillStepper name={`${path}.tb`} label="Tiebreak" />
        </div>
      </div>
    </div>
  )
}
