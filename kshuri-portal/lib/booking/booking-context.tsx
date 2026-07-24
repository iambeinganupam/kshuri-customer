'use client'

// ─────────────────────────────────────────────────────────────────────────────
// BookingProvider — context shared across /book/[slug]/* step pages
// ─────────────────────────────────────────────────────────────────────────────
// Wraps a sessionStorage-backed draft (useBookingDraft) plus the vendor
// summary loaded by the route layout. Step pages read selectedServices and
// call updateDraft / resetDraft instead of poking sessionStorage directly.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useBookingDraft } from './use-booking-draft'
import type { BookingDraft, VendorService } from './booking-types'

export interface VendorSummary {
  id: string
  slug: string
  name: string
  type: 'freelancer' | 'salon_location'
  services: VendorService[]
}

interface BookingContextValue {
  vendor: VendorSummary
  draft: BookingDraft
  selectedServices: VendorService[]
  updateDraft: (patch: Partial<BookingDraft>) => void
  resetDraft: () => void
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({
  vendor,
  children,
}: {
  vendor: VendorSummary
  children: ReactNode
}) {
  const { draft, update, reset } = useBookingDraft(vendor.slug)

  const selectedServices = useMemo(
    () =>
      draft.selectedServiceIds
        .map((id) => vendor.services.find((s) => s.id === id))
        .filter((s): s is VendorService => Boolean(s)),
    [draft.selectedServiceIds, vendor.services],
  )

  const value = useMemo<BookingContextValue>(
    () => ({
      vendor,
      draft,
      selectedServices,
      updateDraft: update,
      resetDraft: reset,
    }),
    [vendor, draft, selectedServices, update, reset],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>')
  return ctx
}
