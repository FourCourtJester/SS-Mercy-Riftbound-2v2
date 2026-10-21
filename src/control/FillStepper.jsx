import { Stepper } from '@single-studio/core/control'

/**
 * A Stepper that fills its column. The stock one is a fixed 160px, which in a
 * wider column leaves it in the corner; here the number field takes whatever room
 * is left between the two buttons.
 */
export function FillStepper({ className = '', ...props }) {
  return <Stepper className={`[&_.ss-stepper-value]:flex-1 ${className}`} {...props} />
}
