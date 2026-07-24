// ─────────────────────────────────────────────────────────────────────────────
// Vendor kind — the customer-facing distinction between independent
// freelancers and salon vendors.
//
// Deliberately *not* "Home Service vs At Salon" — both freelancers and salons
// can offer either service mode (a freelancer may have a studio; a salon may
// send a stylist to your home). Until per-vendor service-mode capability is
// captured in the data model, the only honest split we can show is by vendor
// type. Labels and helpers below stay vendor-type-centric and avoid claims
// the data can't back up.
//
// Single source of truth for labels, icons, accent classes, and helper copy.
// Every customer-facing surface (card badge, listing filter, profile chrome)
// reads from here so the language stays consistent.
// ─────────────────────────────────────────────────────────────────────────────

import { User, Store, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** Customer-facing vendor kinds — one-to-one with backend `vendor_type` but
 *  named so we can swap to a richer service-mode taxonomy later without
 *  rippling through every consumer. */
export type VendorMode = 'home' | 'salon'

/** Filter selector values — includes the 'all' meta-option for listing pages. */
export type VendorModeFilter = 'all' | VendorMode

export interface VendorModeMeta {
  /** Long label used as a section header or filter pill ("Home Service"). */
  label: string
  /** Compact label used in card chips ("Home"). */
  shortLabel: string
  /** One-line helper copy shown next to the label on filter chips / profile header. */
  helper: string
  /** Icon — matches the metaphor (Home = comes to you, Store = visit them). */
  icon: LucideIcon
  /** Tailwind classes for the soft-accent variant (background + foreground + border). */
  accentSoft: string
  /** Tailwind classes for the solid-accent variant. */
  accentSolid: string
}

export const VENDOR_MODE_META: Record<VendorMode, VendorModeMeta> = {
  home: {
    label: 'Freelancers',
    shortLabel: 'Freelancer',
    helper: 'Solo artists & independents — many offer home service',
    icon: User,
    accentSoft:
      'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300',
    accentSolid:
      'bg-emerald-500 text-white border-transparent hover:bg-emerald-500/90',
  },
  salon: {
    label: 'Vendors',
    shortLabel: 'Vendor',
    helper: 'Established businesses with a physical outlet',
    icon: Store,
    accentSoft:
      'bg-indigo-500/10 text-indigo-700 border-indigo-500/30 dark:text-indigo-300',
    accentSolid:
      'bg-indigo-500 text-white border-transparent hover:bg-indigo-500/90',
  },
}

/** Meta for the "All" filter chip — kept here so the same icon/copy can be
 *  reused everywhere the filter renders. */
export const VENDOR_MODE_ALL_META: VendorModeMeta = {
  label: 'All',
  shortLabel: 'All',
  helper: 'Browse everyone',
  icon: Sparkles,
  accentSoft:
    'bg-primary/10 text-primary border-primary/30',
  accentSolid: 'bg-primary text-primary-foreground border-transparent hover:bg-primary/90',
}

/** Backend `vendor_type` → customer-facing mode. Returns null when the field
 *  is unknown so callers can decide whether to fall back gracefully. */
export function vendorTypeToMode(
  vendorType: string | null | undefined,
): VendorMode | null {
  if (vendorType === 'freelancer') return 'home'
  if (vendorType === 'salon_location') return 'salon'
  return null
}

/** Customer-facing mode → backend `vendor_type` filter value. Used when
 *  building `SearchParams.vendor_type` from the listing-page filter state. */
export function modeToVendorType(
  mode: VendorMode,
): 'freelancer' | 'salon_location' {
  return mode === 'home' ? 'freelancer' : 'salon_location'
}
