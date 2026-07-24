'use client'

// ─────────────────────────────────────────────────────────────────────────────
// IntentTimer — countdown for the slot-lock window on /book/[slug]/confirm.
// ─────────────────────────────────────────────────────────────────────────────
// The server returns `expires_at` (ISO). We anchor against an optional
// `serverNowAtFetch` to compensate for client clock drift — both timestamps
// are converted to ms and we extrapolate from there. Updates twice a second
// for smooth rendering without burning power.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IntentTimerProps {
  expiresAt: string
  serverNowAtFetch?: string
  onExpire?: () => void
  className?: string
}

function format(msRemaining: number): string {
  if (msRemaining <= 0) return '0:00'
  const totalSec = Math.floor(msRemaining / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function IntentTimer({
  expiresAt,
  serverNowAtFetch,
  onExpire,
  className,
}: IntentTimerProps) {
  // driftMs / initial-remaining are computed inside an effect rather than
  // during render — React 19's strict lint flags Date.now() at render time
  // as impure. The 500ms tick fixes up state immediately after mount.
  const expiresMs = useMemo(() => new Date(expiresAt).getTime(), [expiresAt])

  const [remaining, setRemaining] = useState<number>(0)

  useEffect(() => {
    // Compute drift inside the effect so render stays pure.
    const driftMs = serverNowAtFetch
      ? new Date(serverNowAtFetch).getTime() - Date.now()
      : 0
    const tick = () => {
      const next = Math.max(0, expiresMs - (Date.now() + driftMs))
      setRemaining(next)
      if (next === 0) {
        onExpire?.()
        window.clearInterval(id)
      }
    }
    const id = window.setInterval(tick, 500)
    tick()
    return () => window.clearInterval(id)
  }, [expiresMs, serverNowAtFetch, onExpire])

  const isUrgent = remaining > 0 && remaining < 2 * 60_000
  const isExpired = remaining === 0

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium tabular-nums',
        isExpired && 'bg-destructive/10 text-destructive',
        !isExpired && isUrgent && 'bg-amber-500/10 text-amber-700',
        !isExpired && !isUrgent && 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {isExpired ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      <span>
        {isExpired
          ? 'Time up — please re-pick your slot'
          : `Holding your slot · ${format(remaining)}`}
      </span>
    </div>
  )
}
