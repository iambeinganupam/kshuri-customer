'use client'

// ─────────────────────────────────────────────────────────────────────────────
// /book/[slug]/confirm — final step: review, pick payment, confirm
// ─────────────────────────────────────────────────────────────────────────────
// Shows the slot-hold countdown (server-clock anchored), the booking
// summary, a payment-method picker, and a Confirm button. Back button
// releases the locked intent before navigating to /slot so the slot frees
// up immediately for the next customer.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  useAddresses,
  useBookingIntent,
  useConfirmBooking,
  useReleaseIntent,
} from '@kshuri/api-client'
import { Button } from '@/components/ui/button'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { IntentTimer } from '@/components/booking/IntentTimer'
import {
  PaymentMethodSelect,
  type PaymentMethod,
} from '@/components/booking/PaymentMethodSelect'
import { addressRequired } from '@/lib/booking/address-required'
import { useBooking } from '@/lib/booking/booking-context'

const AVAILABLE_METHODS: PaymentMethod[] = ['card', 'upi', 'cash']

export default function ConfirmStep() {
  const router = useRouter()
  const { vendor, draft, selectedServices, updateDraft, resetDraft } = useBooking()

  // Guards: bounce to the right step when state is missing. Run in an
  // effect so render is consistent (no early-return-before-hooks).
  useEffect(() => {
    if (!draft.intentId || !draft.selectedSlot) {
      router.replace(`/book/${vendor.slug}/slot`)
      return
    }
    if (addressRequired(selectedServices) && !draft.customerAddressId) {
      router.replace(`/book/${vendor.slug}/address`)
    }
  }, [
    draft.intentId,
    draft.selectedSlot,
    draft.customerAddressId,
    selectedServices,
    router,
    vendor.slug,
  ])

  const intentQuery = useBookingIntent(draft.intentId)
  const { data: addresses } = useAddresses()
  const confirmMutation = useConfirmBooking()
  const releaseMutation = useReleaseIntent()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(
    draft.paymentMethod,
  )
  const [submitting, setSubmitting] = useState(false)

  // Server-clock anchor for the timer: take the timestamp of the latest
  // intent query as the moment we last heard from the server.
  const serverNowAtFetch = useMemo(
    () =>
      intentQuery.dataUpdatedAt
        ? new Date(intentQuery.dataUpdatedAt).toISOString()
        : undefined,
    [intentQuery.dataUpdatedAt],
  )

  // Kick back to the slot picker only when the intent is genuinely gone
  // (server returned null) or transitioned into a terminal-FAILURE state.
  // We deliberately ignore `status: 'converted'` because that fires on
  // every successful Confirm Booking (the convert mutation invalidates
  // bookingKeys.all → refetch → row comes back as 'converted'), and we
  // do NOT want to bounce the user mid-navigation to /success.
  useEffect(() => {
    if (!intentQuery.isSuccess) return
    const data = intentQuery.data
    const isGone = data === null
    const isFailedTerminal =
      data?.status === 'expired' || data?.status === 'cancelled'
    if (!isGone && !isFailedTerminal) return

    toast.error('Your slot reservation has expired. Please pick again.')
    updateDraft({
      intentId: undefined,
      intentExpiresAt: undefined,
      selectedSlot: undefined,
    })
    router.replace(`/book/${vendor.slug}/slot`)
  }, [
    intentQuery.isSuccess,
    intentQuery.data,
    router,
    updateDraft,
    vendor.slug,
  ])

  // Fallback expiry of 1 minute is a worst-case placeholder when both the
  // server and sessionStorage have nothing — render stays pure by reading
  // a stable hardcoded UTC string; the live timer rehydrates from the
  // intent query the moment it resolves.
  const expiresAt =
    intentQuery.data?.expires_at ??
    draft.intentExpiresAt ??
    '1970-01-01T00:00:00.000Z'

  const address = (addresses ?? []).find((a) => a.id === draft.customerAddressId)
  const addressLabel = address
    ? `${address.address_line1}, ${address.city} ${address.postal_code ?? ''}`.trim()
    : undefined

  async function onConfirm() {
    if (!paymentMethod || submitting || !draft.intentId) return
    setSubmitting(true)

    try {
      // Persist payment_method + customer_address_id on the appointment.
      // The backend re-validates address ownership; cash-cap is enforced
      // by the payment-method handler registry.
      const result = await confirmMutation.mutateAsync({
        intentId: draft.intentId,
        payment_method: paymentMethod,
        customer_address_id: draft.customerAddressId,
      })
      const appointmentId = result.id
      // Navigate to /success — do NOT resetDraft here. The reset is
      // moved to the /success page's mount (see success/[id]/page.tsx)
      // because clearing the draft in this same tick races the
      // navigation: the page's "missing intent → /slot" guard effect
      // fires on the re-render, replaces to /slot which then replaces
      // to /services because selectedServices is empty too.
      router.push(`/book/${vendor.slug}/success/${appointmentId}`)
    } catch (err: unknown) {
      const code =
        (err as { code?: string; response?: { data?: { error?: { code?: string } } } })
          ?.code ??
        (err as { response?: { data?: { error?: { code?: string } } } })?.response
          ?.data?.error?.code ??
        ''
      if (code.includes('EXPIRED') || code.includes('NOT_FOUND')) {
        toast.error('Your slot reservation expired. Please pick again.')
        updateDraft({
          intentId: undefined,
          intentExpiresAt: undefined,
          selectedSlot: undefined,
        })
        router.replace(`/book/${vendor.slug}/slot`)
      } else if (code.includes('PAYMENT')) {
        toast.error('Payment failed. Try another method.')
      } else {
        toast.error('Could not complete your booking. Please try again.')
      }
      setSubmitting(false)
    }
  }

  function onBack() {
    if (draft.intentId) releaseMutation.mutate(draft.intentId)
    updateDraft({
      intentId: undefined,
      intentExpiresAt: undefined,
      selectedSlot: undefined,
    })
    router.push(`/book/${vendor.slug}/slot`)
  }

  if (!draft.intentId || !draft.selectedSlot) {
    // Render a placeholder while the guard effect navigates away.
    return <p className="text-sm text-muted-foreground">Loading booking…</p>
  }

  return (
    <section className="space-y-4">
      <IntentTimer
        expiresAt={expiresAt}
        serverNowAtFetch={serverNowAtFetch}
        onExpire={() => router.replace(`/book/${vendor.slug}/slot`)}
      />

      <BookingSummary
        vendorName={vendor.name}
        services={selectedServices}
        slotStart={draft.selectedSlot.start}
        slotEnd={draft.selectedSlot.end}
        addressLabel={addressLabel}
      />

      <PaymentMethodSelect
        value={paymentMethod}
        onChange={(m) => {
          setPaymentMethod(m)
          updateDraft({ paymentMethod: m })
        }}
        availableMethods={AVAILABLE_METHODS}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Pick a different slot
        </Button>
        <Button
          size="lg"
          onClick={onConfirm}
          disabled={!paymentMethod || submitting}
        >
          {submitting ? 'Confirming…' : 'Confirm booking'}
        </Button>
      </div>
    </section>
  )
}
