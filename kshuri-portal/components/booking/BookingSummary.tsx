'use client'

// ─────────────────────────────────────────────────────────────────────────────
// BookingSummary — vendor + services + slot + total preview.
// ─────────────────────────────────────────────────────────────────────────────
// Used on the confirm step and (with no address label) on the success page.
// GST defaults to 18% to match BILL_TAX_RATE in the backend; the parent can
// override when the vendor has a custom rate.
// ─────────────────────────────────────────────────────────────────────────────

import { Calendar, MapPin } from 'lucide-react'
import type { VendorService } from '@/lib/booking/booking-types'

interface BookingSummaryProps {
  vendorName: string
  services: VendorService[]
  slotStart: string
  slotEnd: string
  taxRate?: number
  addressLabel?: string
}

function formatINR(amt: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amt)
}

function formatSlotRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const dateStr = s.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const startT = s.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const endT = e.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${dateStr} · ${startT} – ${endT}`
}

export function BookingSummary({
  vendorName,
  services,
  slotStart,
  slotEnd,
  taxRate = 0.18,
  addressLabel,
}: BookingSummaryProps) {
  const subtotal = services.reduce((sum, s) => sum + Number(s.price ?? 0), 0)
  const tax = Math.round(subtotal * taxRate)
  const total = subtotal + tax

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Booking with
        </p>
        <p className="font-semibold">{vendorName}</p>
      </div>

      <div className="space-y-2">
        {services.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between text-sm"
          >
            <span>{s.name}</span>
            <span>{formatINR(Number(s.price ?? 0))}</span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-sm">
        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span>{formatSlotRange(slotStart, slotEnd)}</span>
      </div>

      {addressLabel && (
        <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-sm">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{addressLabel}</span>
        </div>
      )}

      <div className="space-y-1 border-t pt-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax (GST)</span>
          <span>{formatINR(tax)}</span>
        </div>
        <div className="flex justify-between pt-1 text-base font-semibold">
          <span>Total</span>
          <span>{formatINR(total)}</span>
        </div>
      </div>
    </div>
  )
}
