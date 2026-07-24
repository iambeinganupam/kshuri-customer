'use client'

// ─────────────────────────────────────────────────────────────────────────────
// /book/[slug]/success/[id] — confirmation screen after intent-convert
// ─────────────────────────────────────────────────────────────────────────────
// Loads the freshly created appointment by id, renders the booking summary
// for visual confirmation, and offers CTAs to the dashboard and back to
// vendor discovery.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { use, useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useAppointment } from '@kshuri/api-client'
import { Button } from '@/components/ui/button'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { useBooking } from '@/lib/booking/booking-context'
import type { VendorService } from '@/lib/booking/booking-types'

export default function SuccessStep({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { id } = use(params)
  const { data: appointment, isLoading } = useAppointment(id)

  // The draft cleanup lives HERE — not in the confirm page — to avoid
  // racing the post-convert navigation. If we resetDraft on the confirm
  // page, the page re-renders with intentId=undefined, its "missing
  // intent" guard effect fires, and router.replaces the user back to
  // /slot (and then /services). Running it on /success mount means the
  // navigation has already committed before the reset.
  const { resetDraft } = useBooking()
  useEffect(() => {
    resetDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Fetching your booking…</p>
    )
  }
  if (!appointment) {
    return (
      <p className="text-sm text-destructive">
        Could not load your booking. Check your dashboard.
      </p>
    )
  }

  // The appointment response carries either a flat service_* field set or a
  // services[] array of line items. Normalise to the VendorService shape the
  // BookingSummary expects.
  const summaryServices: VendorService[] = appointment.services?.length
    ? appointment.services.map((s, i) => ({
        id: s.service_id ?? `line-${i}`,
        name: s.service_name,
        category: { id: 'line', name: 'Line item' },
        price: Number(s.locked_price ?? 0),
        default_price: Number(s.locked_price ?? 0),
        duration_minutes: s.duration_minutes ?? 0,
        is_active: true,
      }))
    : [
        {
          id: appointment.service_id ?? 'svc',
          name: appointment.service_name ?? 'Service',
          category: { id: 'svc', name: 'Service' },
          price: Number(appointment.service_price ?? appointment.total_amount ?? 0),
          default_price: Number(
            appointment.service_price ?? appointment.total_amount ?? 0,
          ),
          duration_minutes: appointment.duration_minutes ?? 0,
          is_active: true,
        },
      ]

  return (
    <section className="space-y-6 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
      <div>
        <h2 className="text-xl font-semibold">Booking confirmed</h2>
        <p className="text-sm text-muted-foreground">
          Booking #{appointment.id.slice(0, 8)}
        </p>
      </div>

      <div className="mx-auto max-w-md text-left">
        <BookingSummary
          vendorName={appointment.vendor_name ?? 'Vendor'}
          services={summaryServices}
          slotStart={appointment.start_time ?? ''}
          slotEnd={appointment.end_time ?? ''}
        />
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href={`/dashboard/bookings/${appointment.id}`}>View booking</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/vendors">Book another</Link>
        </Button>
      </div>
    </section>
  )
}
