'use client'

// ─────────────────────────────────────────────────────────────────────────────
// /book/[slug]/address — step 3 (conditional): pick a delivery address
// ─────────────────────────────────────────────────────────────────────────────
// Only reached when one of the selected services is delivered at the
// customer's location. Lists saved addresses; opens the existing add-
// address dialog to capture a new one. Continue routes to /confirm.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Plus } from 'lucide-react'
import { useAddresses } from '@kshuri/api-client'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { AddressFormDialog } from '@/components/dashboard/address-form-dialog'
import { addressRequired } from '@/lib/booking/address-required'
import { useBooking } from '@/lib/booking/booking-context'

export default function AddressStep() {
  const router = useRouter()
  const { vendor, draft, selectedServices, updateDraft } = useBooking()
  const { data: addresses, isLoading } = useAddresses()
  const [dialogOpen, setDialogOpen] = useState(false)

  // Guard: if the user wandered here without selecting a home service or
  // without picking services at all, bounce back to the right step.
  useEffect(() => {
    if (selectedServices.length === 0) {
      router.replace(`/book/${vendor.slug}/services`)
      return
    }
    if (!addressRequired(selectedServices)) {
      router.replace(`/book/${vendor.slug}/slot`)
    }
  }, [selectedServices, router, vendor.slug])

  // Auto-select default address (or the first one) when none is picked yet.
  useEffect(() => {
    if (draft.customerAddressId) return
    const list = addresses ?? []
    if (list.length === 0) return
    const def = list.find((a) => a.is_default) ?? list[0]
    updateDraft({ customerAddressId: def.id })
  }, [addresses, draft.customerAddressId, updateDraft])

  const onContinue = () => {
    if (!draft.customerAddressId) return
    // The slot must already be reserved by step 2 — if not, fall back to
    // /slot so the user picks one first.
    if (!draft.intentId || !draft.selectedSlot) {
      router.replace(`/book/${vendor.slug}/slot`)
      return
    }
    router.push(`/book/${vendor.slug}/confirm`)
  }

  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Where should the service happen?
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading addresses…</p>
      ) : (addresses ?? []).length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <MapPin className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No saved addresses yet — add one to continue.
          </p>
          <Button className="mt-4" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add an address
          </Button>
        </div>
      ) : (
        <>
          <RadioGroup
            value={draft.customerAddressId ?? ''}
            onValueChange={(id) => updateDraft({ customerAddressId: id })}
            className="space-y-2"
          >
            {(addresses ?? []).map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <RadioGroupItem value={a.id} id={`addr-${a.id}`} className="mt-1" />
                <Label
                  htmlFor={`addr-${a.id}`}
                  className="flex-1 cursor-pointer space-y-1"
                >
                  <span className="block font-medium">{a.label || 'Saved address'}</span>
                  <span className="block text-sm text-muted-foreground">
                    {a.address_line1}
                    {a.address_line2 ? `, ${a.address_line2}` : ''}, {a.city}{' '}
                    {a.postal_code ?? ''}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
          <Button
            variant="outline"
            onClick={() => setDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-1 h-4 w-4" /> Add new address
          </Button>
        </>
      )}

      <div className="pt-4">
        <Button
          size="lg"
          onClick={onContinue}
          disabled={!draft.customerAddressId}
        >
          Continue to confirm
        </Button>
      </div>

      <AddressFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  )
}
