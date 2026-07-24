'use client'

// ─────────────────────────────────────────────────────────────────────────────
// BookingShell — client wrapper that loads the vendor, mounts the
// BookingProvider, and renders the step header.
// ─────────────────────────────────────────────────────────────────────────────
// The auth gate (proxy.ts) ensures only signed-in customers reach this code.
// We load the vendor via the existing /vendors/:slug query the rest of the
// portal already uses; failing that, render a friendly not-found.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useVendorBySlug } from '@kshuri/api-client'
import { useAuth } from '@/lib/auth/auth-context'
import { BookingProvider, type VendorSummary } from '@/lib/booking/booking-context'
import { addressRequired } from '@/lib/booking/address-required'
import { BookingStepNav, type BookingStep } from '@/components/booking/BookingStepNav'
import type { VendorService } from '@/lib/booking/booking-types'
import { useBooking } from '@/lib/booking/booking-context'
import { useCurrentStep } from '../_lib/use-current-step'

interface BookingShellProps {
  slug: string
  children: ReactNode
}

export function BookingShell({ slug, children }: BookingShellProps) {
  const vendorQuery = useVendorBySlug(slug)

  // Client-side auth guard. proxy.ts already checks cookie *presence* at
  // the edge, but a stale cookie (mid-rotation, expired rtv, etc.) can let
  // a request through while `silentRefresh` 401s and React stays
  // anonymous. In that limbo every API call 401s and the user is stranded.
  //
  // We mirror the proxy: redirect to /login with ?redirect=<current path>
  // the moment auth has resolved to "not signed in". `isLoading` covers
  // the initial silent-refresh window so we don't redirect mid-handshake.
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirect = pathname || `/book/${slug}/services`
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`)
    }
  }, [isLoading, isAuthenticated, pathname, router, slug])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">Checking your session…</p>
      </div>
    )
  }

  if (vendorQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-muted-foreground">Loading vendor…</p>
      </div>
    )
  }

  if (!vendorQuery.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">Vendor not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t find the vendor you&apos;re trying to book with.
        </p>
        <Link href="/vendors" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Browse vendors
        </Link>
      </div>
    )
  }

  const detail = vendorQuery.data
  const services: VendorService[] = (detail.services ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description ?? undefined,
    // The wire type doesn't expose category as an object; the api-client
    // returns the category as a string here, but the booking flow only
    // surfaces it loosely. We fabricate the {id, name} shape so the rest
    // of the api-client's VendorService type is satisfied.
    category: { id: s.category ?? 'uncategorized', name: s.category ?? 'Services' },
    price: Number(s.price ?? 0),
    default_price: Number(s.price ?? 0),
    duration_minutes: s.duration_minutes ?? 0,
    is_active: s.is_active ?? true,
    is_featured: s.is_featured ?? false,
    is_trending: s.is_trending ?? false,
    service_location: s.service_location,
  }))

  const vendorSummary: VendorSummary = {
    id: detail.id,
    slug: detail.url_slug ?? slug,
    name: detail.display_name || detail.business_name,
    type: detail.vendor_type,
    services,
  }

  return (
    <BookingProvider vendor={vendorSummary}>
      <ShellInner>{children}</ShellInner>
    </BookingProvider>
  )
}

function ShellInner({ children }: { children: ReactNode }) {
  const { vendor, selectedServices } = useBooking()
  const { idx } = useCurrentStep()

  const steps = useMemo<BookingStep[]>(() => {
    const base: BookingStep[] = [
      { key: 'services', label: 'Services' },
      { key: 'slot', label: 'Slot' },
    ]
    if (addressRequired(selectedServices)) {
      base.push({ key: 'address', label: 'Address' })
    }
    base.push({ key: 'confirm', label: 'Confirm' })
    return base
  }, [selectedServices])

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:py-10">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold">Book {vendor.name}</h1>
        <BookingStepNav steps={steps} currentIdx={Math.max(0, idx)} />
      </header>
      {children}
    </div>
  )
}
