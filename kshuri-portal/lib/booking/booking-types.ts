// ─────────────────────────────────────────────────────────────────────────────
// Booking flow — shared types
// ─────────────────────────────────────────────────────────────────────────────
// View-model the /book/[slug]/* route group passes around. Wire types
// (VendorService, ServiceLocation) live in @kshuri/api-client and are
// re-exported here so booking-flow modules import a single canonical name.
// ─────────────────────────────────────────────────────────────────────────────

import type { ServiceLocation, VendorService } from '@kshuri/api-client'

export type { ServiceLocation, VendorService }

export interface SelectedSlot {
  start: string
  end: string
  staffMemberId?: string
}

export interface BookingDraft {
  vendorSlug: string
  selectedServiceIds: string[]
  selectedSlot?: SelectedSlot
  intentId?: string
  intentExpiresAt?: string
  customerAddressId?: string
  paymentMethod?: 'card' | 'upi' | 'cash'
  idempotencyKey?: string
}

export const EMPTY_DRAFT: Omit<BookingDraft, 'vendorSlug'> = {
  selectedServiceIds: [],
}
