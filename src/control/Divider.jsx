/**
 * A rule between groups of controls in a panel. A panel spaces its children evenly,
 * so this sits in the same gap as everything else rather than adding margins.
 *
 * Core has `Break`, but it is deprecated and draws nothing.
 */
export function Divider() {
  return <hr className="border-slate-800" />
}
