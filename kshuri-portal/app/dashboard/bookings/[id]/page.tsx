'use client'

// ─────────────────────────────────────────────────────────────────────────────
// /dashboard/bookings/[id] — detail view for a single appointment
// ─────────────────────────────────────────────────────────────────────────────
// Renders the lifecycle timeline, vendor + slot cards, an optional link to
// the linked transaction, and Cancel/Reschedule actions (only when the
// booking is still in a cancellable state).
// ─────────────────────────────────────────────────────────────────────────────

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ChevronLeft } from 'lucide-react'
import { useAppointment, useAppointmentAction } from '@kshuri/api-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { BookingStatusTimeline } from '@/components/dashboard/BookingStatusTimeline'

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: appointment, isLoading } = useAppointment(id)
  const action = useAppointmentAction()
  const [cancelReason, setCancelReason] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }
  if (!appointment) {
    return <p className="text-sm text-destructive">Booking not found.</p>
  }

  const canCancel = ['pending', 'confirmed'].includes(appointment.status)
  const canReschedule = ['pending', 'confirmed'].includes(appointment.status)

  async function onCancel() {
    try {
      await action.mutateAsync({
        appointmentId: id,
        action: 'cancel',
        extra: { cancellation_reason: cancelReason || undefined },
      })
      toast.success('Booking cancelled')
      setCancelOpen(false)
      router.refresh()
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Could not cancel'
      toast.error(msg)
    }
  }

  const startTime = appointment.start_time
    ? new Date(appointment.start_time).toLocaleString('en-IN')
    : '—'
  const endTime = appointment.end_time
    ? new Date(appointment.end_time).toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : ''

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> All bookings
        </Link>
        <h1 className="text-2xl font-semibold">
          Booking #{appointment.id.slice(0, 8)}
        </h1>
        <BookingStatusTimeline status={appointment.status} />
      </header>

      <Card className="space-y-1 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Vendor
        </p>
        <p className="font-semibold">{appointment.vendor_name ?? 'Vendor'}</p>
      </Card>

      <Card className="space-y-1 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Slot
        </p>
        <p>
          {startTime}
          {endTime && ` – ${endTime}`}
        </p>
      </Card>

      {appointment.services && appointment.services.length > 0 && (
        <Card className="space-y-2 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Services
          </p>
          <ul className="space-y-1 text-sm">
            {appointment.services.map((s, i) => (
              <li key={i} className="flex items-center justify-between">
                <span>{s.service_name}</span>
                <span className="text-muted-foreground">
                  ₹{Number(s.locked_price ?? 0).toLocaleString('en-IN')}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {canReschedule && (
          <Button variant="outline" disabled>
            Reschedule
          </Button>
        )}
        {canCancel && (
          <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Cancel booking</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel this booking?</DialogTitle>
              </DialogHeader>
              <Textarea
                placeholder="Reason (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setCancelOpen(false)}>
                  Keep it
                </Button>
                <Button
                  variant="destructive"
                  onClick={onCancel}
                  disabled={action.isPending}
                >
                  {action.isPending ? 'Cancelling…' : 'Cancel booking'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
