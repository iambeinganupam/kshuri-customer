'use client'

// ─────────────────────────────────────────────────────────────────────────────
// /signup/address — optional address step after the name capture
// ─────────────────────────────────────────────────────────────────────────────
// Lands the user here after main signup completes. Skippable — the customer
// can add an address later from /dashboard/addresses. Honors `redirect`
// query (sanitised to start with `/` and not point back at /login or
// /signup) so a /book/* deep-link survives the onboarding detour.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useAddresses } from '@kshuri/api-client'
import { Button } from '@/components/ui/button'
import { AddressFormDialog } from '@/components/dashboard/address-form-dialog'
import { CUSTOMER_BOOKING_FLOW_ENABLED } from '@/lib/feature-flags'

function safeRedirect(raw: string | null): string {
  if (!raw) return '/dashboard'
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return '/dashboard'
  if (raw.startsWith('/login') || raw.startsWith('/signup')) return '/dashboard'
  return raw
}

function AddressStepInner() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = safeRedirect(params.get('redirect'))

  const { data: existing, isLoading } = useAddresses()
  const [dialogOpen, setDialogOpen] = useState(false)

  // Auto-skip when an address already exists — common for returning users
  // who lapsed back through signup.
  useEffect(() => {
    if (!isLoading && (existing ?? []).length > 0) {
      router.replace(redirectTo)
    }
  }, [isLoading, existing, redirectTo, router])

  function onSkip() {
    router.replace(redirectTo)
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Add an address</h1>
        <p className="text-sm text-muted-foreground">
          Optional — you can skip and add one later from your dashboard. We use
          it only for home services.
        </p>
      </header>

      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Add an address to make future home-service bookings faster.
        </p>
        <Button className="mt-4" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Add an address
        </Button>
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
      </div>

      <AddressFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          // When the dialog closes after a successful add, the useAddresses
          // query is invalidated by the mutation hook — the useEffect above
          // will then forward to redirectTo.
        }}
      />

      {/* Flag-gated note so the page degrades cleanly when the booking flow
          isn't enabled yet — useful for an early staging soak. */}
      {!CUSTOMER_BOOKING_FLOW_ENABLED && (
        <p className="text-center text-xs text-muted-foreground">
          Address-aware booking is rolling out soon — adding now still saves
          your details.
        </p>
      )}
    </div>
  )
}

export default function SignupAddressPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-10 text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <AddressStepInner />
    </Suspense>
  )
}
