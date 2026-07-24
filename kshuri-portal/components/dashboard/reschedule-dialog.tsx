'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  useAvailableSlots,
  useRescheduleAppointment,
  type Appointment,
} from '@kshuri/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function RescheduleDialog({ open, onOpenChange, appointment }: RescheduleDialogProps) {
  const [date, setDate] = useState(todayISO())
  const [pickedSlot, setPickedSlot] = useState<{ start: string; end: string } | null>(null)

  const serviceId =
    appointment.service_id ?? appointment.services?.[0]?.service_id ?? ''

  const slots = useAvailableSlots(
    {
      vendor_type: appointment.vendor_type,
      vendor_id: appointment.vendor_id,
      service_id: serviceId,
      date,
    },
    open && !!serviceId,
  )

  const reschedule = useRescheduleAppointment()

  function handleDateChange(v: string) {
    setDate(v)
    setPickedSlot(null)
  }

  function handleSubmit() {
    if (!pickedSlot) {
      toast.warning('Pick a time slot first.')
      return
    }
    reschedule.mutate(
      {
        appointmentId: appointment.id,
        newSlotStart: pickedSlot.start,
        newSlotEnd: pickedSlot.end,
      },
      {
        onSuccess: () => {
          toast.success('Booking rescheduled.')
          onOpenChange(false)
          setPickedSlot(null)
        },
        onError: () =>
          toast.error('Could not reschedule — please try again or contact the vendor.'),
      },
    )
  }

  const available = (slots.data?.slots ?? []).filter((s) => s.available)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reschedule-date">New date</Label>
            <Input
              id="reschedule-date"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={todayISO()}
            />
          </div>

          <div>
            <Label>Available slots</Label>
            {!serviceId ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No service information found for this booking.
              </p>
            ) : slots.isLoading ? (
              <p className="mt-2 text-sm text-muted-foreground">Loading slots…</p>
            ) : available.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No slots available on this date. Try another day.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {available.map((s) => {
                  const isPicked = pickedSlot?.start === s.start
                  return (
                    <button
                      key={s.start}
                      type="button"
                      onClick={() => setPickedSlot({ start: s.start, end: s.end })}
                      className={cn(
                        'rounded-md border px-2 py-2 text-xs transition-colors',
                        isPicked
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card hover:border-primary/40',
                      )}
                    >
                      {new Date(s.start).toLocaleTimeString('en-IN', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!pickedSlot || reschedule.isPending}
          >
            {reschedule.isPending ? 'Saving…' : 'Reschedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
