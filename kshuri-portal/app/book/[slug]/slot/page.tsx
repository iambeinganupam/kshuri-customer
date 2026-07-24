'use client'

// ─────────────────────────────────────────────────────────────────────────────
// /book/[slug]/slot — step 2: pick a date + time slot
// ─────────────────────────────────────────────────────────────────────────────
// The /availability/slots endpoint is per-day, so the parent owns the active
// date and fetches its slots; the SlotPicker is presentational. Clicking a
// slot creates a booking intent (locks the slot for 10 min) and routes
// forward to /address or /confirm.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  useAvailableSlots,
  useCreateIntent,
} from '@kshuri/api-client'
import { SlotPicker, type Slot } from '@/components/booking/SlotPicker'
import { addressRequired } from '@/lib/booking/address-required'
import { useBooking } from '@/lib/booking/booking-context'
import { Button } from '@/components/ui/button'

function todayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function nextDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number]
  const next = new Date(Date.UTC(y, m - 1, d + 1))
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-${String(next.getUTCDate()).padStart(2, '0')}`
}

export default function SlotStep() {
  const router = useRouter()
  const { vendor, draft, selectedServices, updateDraft } = useBooking()
  const [activeDate, setActiveDate] = useState<string>(todayKey())

  // If services aren't picked yet, kick back to step 1 (effect, not render).
  useEffect(() => {
    if (selectedServices.length === 0) {
      router.replace(`/book/${vendor.slug}/services`)
    }
  }, [selectedServices.length, router, vendor.slug])

  // Backend repo currently locks against a single service_id; pass all of
  // the cart's IDs to the slot query so the server's duration math fits the
  // whole cart, but the intent itself locks the first service. The other
  // services in the cart still get billed at convert-time (line items).
  const slotsQuery = useAvailableSlots(
    {
      vendor_type: vendor.type,
      vendor_id: vendor.id,
      service_ids: draft.selectedServiceIds,
      date: activeDate,
    },
    selectedServices.length > 0,
  )

  const slots: Slot[] = useMemo(() => {
    const list = slotsQuery.data?.slots ?? []
    return list
      .filter((s) => s.available)
      .map((s) => ({ start: s.start, end: s.end }))
  }, [slotsQuery.data])

  // Auto-advance to the next day when the user lands on a day with zero
  // available slots — common after-hours when "Today" is fully past the
  // last bookable lead-time slot. Bounded to prevent infinite loops if no
  // day in the next two weeks has any slots (vendor closed every day,
  // etc.). Only auto-advances ONCE per session (idempotent on activeDate).
  const [autoAdvanced, setAutoAdvanced] = useState(false)
  useEffect(() => {
    if (autoAdvanced) return
    if (slotsQuery.isLoading || !slotsQuery.isSuccess) return
    if (activeDate !== todayKey()) return
    if (slots.length > 0) return
    queueMicrotask(() => {
      setAutoAdvanced(true)
      setActiveDate(nextDayKey(activeDate))
    })
  }, [autoAdvanced, slotsQuery.isLoading, slotsQuery.isSuccess, activeDate, slots.length])

  const createIntent = useCreateIntent()
  // Step 2 is select-then-continue: clicking a slot only highlights it here;
  // the intent lock + forward navigation happen when the user hits Continue.
  const [chosen, setChosen] = useState<Slot | undefined>(draft.selectedSlot)

  function goForward() {
    if (addressRequired(selectedServices)) {
      router.push(`/book/${vendor.slug}/address`)
    } else {
      router.push(`/book/${vendor.slug}/confirm`)
    }
  }

  async function handleContinue() {
    const slot = chosen
    if (!slot || selectedServices.length === 0) return

    // Re-continue on the slot we already locked → don't double-lock (which
    // would 409 on uq_booking_intents_active_slot). Just route forward.
    const alreadyLocked =
      draft.intentId &&
      draft.selectedSlot?.start === slot.start &&
      draft.selectedSlot?.end === slot.end
    if (alreadyLocked) {
      goForward()
      return
    }

    const primaryServiceId = draft.selectedServiceIds[0]
    const idempotencyKey = draft.idempotencyKey ?? crypto.randomUUID()

    try {
      const result = await createIntent.mutateAsync({
        vendor_type: vendor.type,
        vendor_id: vendor.id,
        service_id: primaryServiceId,
        slot_start: slot.start,
        slot_end: slot.end,
        staff_member_id: slot.staffMemberId,
      })

      updateDraft({
        selectedSlot: slot,
        idempotencyKey,
        intentId: result.intent_id,
        intentExpiresAt: result.expires_at,
      })

      goForward()
    } catch (err: unknown) {
      const code =
        (err as { code?: string; response?: { data?: { error?: { code?: string } } } })
          ?.code ??
        (err as { response?: { data?: { error?: { code?: string } } } })?.response
          ?.data?.error?.code ??
        ''
      if (code.includes('SLOT_LOCKED') || code.includes('CONFLICT')) {
        toast.error('That slot was just taken. Refreshing availability…')
        slotsQuery.refetch()
        setChosen(undefined)
        updateDraft({ selectedSlot: undefined, idempotencyKey: undefined })
      } else {
        toast.error('Could not reserve that slot. Please try again.')
      }
    }
  }

  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Pick a date and time. Your slot is reserved for 10 minutes once you
        continue.
      </p>
      <SlotPicker
        activeDate={activeDate}
        slots={slots}
        loading={slotsQuery.isLoading || createIntent.isPending}
        selectedSlot={chosen}
        onSelectDate={setActiveDate}
        onSelectSlot={setChosen}
      />

      {/* Back to service selection + forward to confirm. Selecting a slot above
          only highlights it; the user advances explicitly via Continue. */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          variant="ghost"
          onClick={() => router.push(`/book/${vendor.slug}/services`)}
          className="h-11 rounded-xl px-4 font-medium"
        >
          ← Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!chosen || createIntent.isPending}
          className="h-11 rounded-xl px-6 font-medium"
        >
          {createIntent.isPending ? 'Reserving…' : 'Continue →'}
        </Button>
      </div>
    </section>
  )
}
