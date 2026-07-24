'use client'

// ─────────────────────────────────────────────────────────────────────────────
// BookingStatusTimeline — visual progress of an appointment lifecycle.
// ─────────────────────────────────────────────────────────────────────────────
// Renders the happy-path order (pending → confirmed → in_progress →
// completed) and degrades cleanly to a single destructive line for
// cancelled / no_show states.
// ─────────────────────────────────────────────────────────────────────────────

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const ORDER = ['pending', 'confirmed', 'in_progress', 'completed'] as const
type HappyStatus = (typeof ORDER)[number]
type Status = HappyStatus | 'cancelled' | 'no_show'

const LABELS: Record<HappyStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
}

export function BookingStatusTimeline({ status }: { status: Status }) {
  if (status === 'cancelled' || status === 'no_show') {
    return (
      <p className="text-sm font-medium capitalize text-destructive">
        {status === 'no_show' ? 'No show' : 'Cancelled'}
      </p>
    )
  }
  const currentIdx = ORDER.indexOf(status as HappyStatus)
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      {ORDER.map((s, i) => {
        const reached = i <= currentIdx
        return (
          <li key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full border',
                reached
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground/30 text-muted-foreground',
              )}
            >
              {reached ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                i === currentIdx ? 'font-medium' : 'text-muted-foreground',
              )}
            >
              {LABELS[s]}
            </span>
            {i < ORDER.length - 1 && <div className="mx-1 h-px w-4 bg-muted" />}
          </li>
        )
      })}
    </ol>
  )
}
