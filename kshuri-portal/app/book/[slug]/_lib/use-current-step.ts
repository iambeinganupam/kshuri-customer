'use client'

// ─────────────────────────────────────────────────────────────────────────────
// useCurrentStep — derives the active step (services/slot/address/confirm/
// success) from the URL pathname. Used by the BookingShell to advance the
// step indicator at the top of the flow.
// ─────────────────────────────────────────────────────────────────────────────

import { usePathname } from 'next/navigation'

const STEPS = ['services', 'slot', 'address', 'confirm', 'success'] as const
export type BookingStepKey = (typeof STEPS)[number]

export function useCurrentStep(): { step: BookingStepKey | null; idx: number } {
  const pathname = usePathname() ?? ''
  for (let i = 0; i < STEPS.length; i++) {
    if (pathname.includes(`/${STEPS[i]}`)) return { step: STEPS[i], idx: i }
  }
  return { step: null, idx: -1 }
}
