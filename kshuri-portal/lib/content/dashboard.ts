'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard content orchestrators — adapt @kshuri/api-client hooks to the
// portal's customer-dashboard view-model. One file per concern keeps the
// page components dumb.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react'
import { useAppointments, useFavorites, useProfile } from '@kshuri/api-client'
import type { Appointment } from '@kshuri/api-client'

/** Statuses customers think of as "upcoming". Lifted out of the bookings
 *  page so the overview header counter and the Bookings tab agree. The
 *  /api/v1/booking/appointments endpoint only accepts a single status
 *  filter, so we fetch unfiltered and narrow client-side. */
export const UPCOMING_APPOINTMENT_STATUSES = [
  'pending',
  'confirmed',
  'in_progress',
] as const
export const PAST_APPOINTMENT_STATUSES = [
  'completed',
  'cancelled',
  'no_show',
] as const

type UpcomingStatus = (typeof UPCOMING_APPOINTMENT_STATUSES)[number]
function isUpcoming(a: Pick<Appointment, 'status'>): boolean {
  return UPCOMING_APPOINTMENT_STATUSES.includes(a.status as UpcomingStatus)
}

/** Overview data — three independent queries, deliberately not joined so each
 *  card can render skeleton/empty independently.
 *
 *  We DON'T server-filter by `status: 'confirmed'` because every freshly
 *  converted booking starts as `pending` (vendor hasn't accepted yet). That
 *  filter made the overview show zero while the Bookings tab showed seven.
 *  Instead, fetch the most recent slice and narrow on the client to the
 *  same "upcoming" predicate the Bookings tab uses. */
export function useDashboardOverview() {
  const profile = useProfile()
  const rawAppointments = useAppointments({ limit: 50 })
  const favorites = useFavorites()

  // Project rawAppointments → a sliced "upcoming" page-like result so the
  // existing callsites (`upcoming.data?.items?.[0]`, `.length`) keep working.
  const upcoming = useMemo(() => {
    const items = (rawAppointments.data?.items ?? []).filter(isUpcoming)
    items.sort((a, b) => {
      const at = new Date(a.start_time ?? 0).getTime()
      const bt = new Date(b.start_time ?? 0).getTime()
      return at - bt
    })
    return {
      data: { items, has_more: false },
      isLoading: rawAppointments.isLoading,
      isError: rawAppointments.isError,
    }
  }, [rawAppointments.data, rawAppointments.isLoading, rawAppointments.isError])

  return { profile, upcoming, favorites }
}

/** Greeting: first name when available, else display name, else "there". */
export function getGreetingName(
  profile: { first_name?: string; business_name?: string } | null | undefined,
): string {
  return profile?.first_name?.trim() || profile?.business_name?.trim() || 'there'
}

export function formatAppointmentTime(appt: Pick<Appointment, 'start_time'>): string {
  if (!appt.start_time) return 'Time TBD'
  const d = new Date(appt.start_time)
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    day:     'numeric',
    month:   'short',
    hour:    'numeric',
    minute:  '2-digit',
    hour12:  true,
  })
}

export function formatAppointmentStatus(status: string | undefined): {
  label: string
  className: string
} {
  switch (status) {
    case 'pending':
      return { label: 'Pending',     className: 'bg-amber-100 text-amber-800 border-amber-200' }
    case 'confirmed':
      return { label: 'Confirmed',   className: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    case 'in_progress':
      return { label: 'In progress', className: 'bg-blue-100 text-blue-800 border-blue-200' }
    case 'completed':
      return { label: 'Completed',   className: 'bg-slate-100 text-slate-700 border-slate-200' }
    case 'cancelled':
      return { label: 'Cancelled',   className: 'bg-rose-100 text-rose-800 border-rose-200' }
    case 'no_show':
      return { label: 'No-show',     className: 'bg-zinc-100 text-zinc-700 border-zinc-200' }
    default:
      return { label: status ?? 'Unknown', className: 'bg-muted text-muted-foreground border-border' }
  }
}
