'use client'

// ─────────────────────────────────────────────────────────────────────────────
// SlotPicker — 14-day strip + bookable-slot grid for the booking flow.
// ─────────────────────────────────────────────────────────────────────────────
// The backend's /availability/slots endpoint takes a single date, so we keep
// the per-day query lifecycle in the parent. This component is a controlled
// strip-of-days + grid-of-times pair: the parent feeds today's slots and the
// active day index; switching days fires `onSelectDate(dateKey)` so the
// parent can refetch.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface Slot {
  start: string
  end: string
  staffMemberId?: string
}

interface SlotPickerProps {
  /** YYYY-MM-DD of the currently-selected day. */
  activeDate: string
  /** Slots available on `activeDate`. */
  slots: Slot[]
  loading?: boolean
  selectedSlot?: Slot
  onSelectDate: (dateKey: string) => void
  onSelectSlot: (slot: Slot) => void
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function ymd(d: Date): string {
  // Local-day key so the 14-day strip lines up with the user's clock,
  // not UTC midnight.
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDayLabel(d: Date, idx: number): string {
  if (idx === 0) return 'Today'
  if (idx === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function SlotPicker({
  activeDate,
  slots,
  loading,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
}: SlotPickerProps) {
  const days = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Array.from({ length: 14 }, (_, i) => addDays(today, i))
  }, [])

  const activeIdx = days.findIndex((d) => ymd(d) === activeDate)
  const safeActiveIdx = activeIdx === -1 ? 0 : activeIdx

  return (
    <div className="space-y-6">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {days.map((d, i) => {
          const key = ymd(d)
          const isActive = i === safeActiveIdx
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(key)}
              className={cn(
                'flex min-w-[5rem] flex-col items-center rounded-lg border px-3 py-2 text-xs transition',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'hover:border-foreground/30',
              )}
            >
              <span className="font-medium">{formatDayLabel(d, i)}</span>
              <span
                className={cn(
                  'mt-1 text-[10px]',
                  isActive ? 'opacity-90' : 'text-muted-foreground',
                )}
              >
                {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No slots available on this day.</p>
          {safeActiveIdx < days.length - 1 && (
            <Button
              variant="link"
              onClick={() => onSelectDate(ymd(days[safeActiveIdx + 1]))}
            >
              Try the next day →
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {slots.map((slot) => {
            const isSelected =
              selectedSlot?.start === slot.start && selectedSlot?.end === slot.end
            return (
              <button
                key={`${slot.start}-${slot.staffMemberId ?? ''}`}
                type="button"
                onClick={() => onSelectSlot(slot)}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-sm font-medium transition',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'hover:border-foreground/30',
                )}
                aria-pressed={isSelected}
              >
                {formatTime(slot.start)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
