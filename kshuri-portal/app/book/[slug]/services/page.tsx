'use client'

// ─────────────────────────────────────────────────────────────────────────────
// /book/[slug]/services — step 1: pick services
// ─────────────────────────────────────────────────────────────────────────────
// Toggles services on the draft. Continue routes to /address when the
// selection includes a home service AND the customer has no saved address,
// otherwise it goes straight to /slot.
// ─────────────────────────────────────────────────────────────────────────────

import { useRouter } from 'next/navigation'
import { useAddresses } from '@kshuri/api-client'
import { ServicePicker } from '@/components/booking/ServicePicker'
import { addressRequired } from '@/lib/booking/address-required'
import { useBooking } from '@/lib/booking/booking-context'

export default function ServicesStep() {
  const router = useRouter()
  const { vendor, draft, updateDraft } = useBooking()
  const { data: addressList } = useAddresses()

  const toggle = (id: string) => {
    const next = draft.selectedServiceIds.includes(id)
      ? draft.selectedServiceIds.filter((x) => x !== id)
      : [...draft.selectedServiceIds, id]
    updateDraft({ selectedServiceIds: next })
  }

  const onContinue = () => {
    const selected = vendor.services.filter((s) =>
      draft.selectedServiceIds.includes(s.id),
    )
    const needsAddress = addressRequired(selected)
    const hasAnyAddress = (addressList ?? []).length > 0
    if (needsAddress && !hasAnyAddress) {
      router.push(`/book/${vendor.slug}/address`)
    } else {
      router.push(`/book/${vendor.slug}/slot`)
    }
  }

  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">Pick one or more services.</p>
      <ServicePicker
        services={vendor.services}
        selectedIds={draft.selectedServiceIds}
        onToggle={toggle}
        onContinue={onContinue}
      />
    </section>
  )
}
