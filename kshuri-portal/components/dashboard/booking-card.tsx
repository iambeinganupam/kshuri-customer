'use client'

import Link from 'next/link'
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react'
import type { Appointment } from '@kshuri/api-client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatAppointmentTime, formatAppointmentStatus } from '@/lib/content/dashboard'
import { formatINR } from '@/lib/format'

interface BookingCardProps {
  appointment: Appointment
  detailHref?: string
  /** Show inline action buttons (Cancel / Reschedule). Defaults false — Overview
   *  shows a read-only card; Bookings list shows actions. */
  showActions?: boolean
  onCancel?: () => void
  onReschedule?: () => void
}

export function BookingCard({
  appointment, detailHref, showActions = false, onCancel, onReschedule,
}: BookingCardProps) {
  const status = formatAppointmentStatus(appointment.status)
  const total = appointment.total_amount ?? appointment.service_price ?? 0
  const serviceLabel =
    appointment.service_name ??
    appointment.services?.[0]?.service_name ??
    'Service'

  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-foreground">
              {appointment.vendor_name ?? 'Vendor'}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{serviceLabel}</p>
          </div>
          <Badge variant="outline" className={status.className}>{status.label}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatAppointmentTime(appointment)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>{appointment.duration_minutes ? `${appointment.duration_minutes} min` : '—'}</span>
          </div>
          {appointment.assigned_staff && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">With {appointment.assigned_staff}</span>
            </div>
          )}
          {total > 0 && (
            <div className="text-right font-semibold text-foreground">
              {formatINR(total)}
            </div>
          )}
        </div>

        {(detailHref || showActions) && (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
            {detailHref && (
              <Button asChild variant="outline" size="sm">
                <Link href={detailHref}>
                  View details
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
            {showActions && appointment.status === 'confirmed' && (
              <>
                {onReschedule && (
                  <Button variant="outline" size="sm" onClick={onReschedule}>
                    Reschedule
                  </Button>
                )}
                {onCancel && (
                  <Button variant="ghost" size="sm" onClick={onCancel} className="text-rose-600 hover:bg-rose-50">
                    Cancel
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
