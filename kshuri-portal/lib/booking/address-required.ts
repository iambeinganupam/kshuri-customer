// ─────────────────────────────────────────────────────────────────────────────
// addressRequired — decide whether the booking flow needs an address step.
// ─────────────────────────────────────────────────────────────────────────────
// True when any selected service is delivered at the customer's location
// (`home` or `both`). All-onsite selections do not require an address.
// ─────────────────────────────────────────────────────────────────────────────

import type { VendorService } from './booking-types'

export function addressRequired(
  services: Pick<VendorService, 'service_location'>[],
): boolean {
  return services.some(
    (s) => s.service_location === 'home' || s.service_location === 'both',
  )
}
