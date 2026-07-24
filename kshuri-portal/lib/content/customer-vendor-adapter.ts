// ─────────────────────────────────────────────────────────────────────────────
// Customer-side VendorDetail → @kshuri/ui shape adapter.
//
// Mirrors what the salon and freelancer dashboards do in their own
// `vendor-adapter.ts` files (one per app) — produces the same
// `VendorProfile` / `VendorService` / `VendorMedia` / `VendorReviewItem` /
// `VendorReviewSummary` view-model the shared components consume.
//
// Result: the customer profile page at /vendors/[slug] renders the exact
// same `@kshuri/ui` components the vendor sees in their "Public Preview" tab.
// ─────────────────────────────────────────────────────────────────────────────

import type { VendorDetail } from '@kshuri/api-client'
import type {
  VendorProfile,
  VendorProduct,
  VendorService,
  VendorMedia,
  VendorReviewItem,
  VendorReviewSummary,
  WorkingHours,
  Certification,
} from '@kshuri/ui/src/components/profile/types'
import { VENDOR_MODE_META, vendorTypeToMode } from '@/lib/vendor-mode'

/** Customer-facing product row — augments @kshuri/ui's `VendorProduct` with
 *  the inventory + category fields the salon dashboard renders. */
export interface CustomerProduct extends VendorProduct {
  category: string | null
  stock: number | null
}

export interface CustomerVendorVM {
  profile: VendorProfile
  services: VendorService[]
  gallery: VendorMedia[]
  reviews: VendorReviewItem[]
  reviewSummary: VendorReviewSummary
  workingHours: WorkingHours[]
  products: CustomerProduct[]
}

function num(v: number | string | null | undefined): number | null {
  if (v == null) return null
  const n = typeof v === 'string' ? Number(v) : v
  return Number.isFinite(n) ? n : null
}

function strOrNull(v: string | null | undefined): string | null {
  if (v == null) return null
  const trimmed = String(v).trim()
  return trimmed.length > 0 ? trimmed : null
}

function composeAddress(detail: VendorDetail): string | null {
  const parts = [detail.address_line1, detail.city, detail.state, detail.postal_code]
    .map((p) => (p ?? '').trim())
    .filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

function trimTime(t: string | null | undefined): string | null {
  if (!t) return null
  return t.length >= 5 ? t.slice(0, 5) : t
}

// ── public API ───────────────────────────────────────────────────────────────

export function adaptVendorDetailToVM(detail: VendorDetail): CustomerVendorVM {
  // Services — coerce NUMERIC strings; treat is_active explicitly so legacy
  // rows without the flag still surface.
  const services: VendorService[] = (detail.services ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description ?? null,
    price: num(s.price) ?? 0,
    duration_minutes: s.duration_minutes ?? null,
    category: s.category ?? null,
    is_active: s.is_active !== false,
    trending: !!s.is_trending,
    featured: !!s.is_featured,
    inclusions: [],
  }))

  // Gallery — sort by sort_order, tag each item with the linked service
  // metadata so the gallery filter chips work.
  const serviceById = new Map(services.map((s) => [s.id, s] as const))
  const gallery: VendorMedia[] = (detail.gallery ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((g) => {
      const svc = g.service_id ? serviceById.get(g.service_id) ?? null : null
      return {
        id: g.id,
        url: g.file_url,
        caption: g.caption ?? g.title ?? null,
        service_id: g.service_id ?? null,
        service_name: svc?.name ?? null,
        service_category: svc?.category ?? null,
      }
    })

  // Working hours — normalize times.
  const workingHours: WorkingHours[] = (detail.working_hours ?? []).map((h) => ({
    day_of_week: h.day_of_week,
    open_time: trimTime(h.open_time),
    close_time: trimTime(h.close_time),
    is_closed: !!h.is_closed,
  }))

  // Today's open/close window.
  const today = new Date().getDay()
  const todayRow = workingHours.find((h) => h.day_of_week === today)
  const isOpenNow = todayRow ? !todayRow.is_closed : null

  // Pricing — derive from active services so the snapshot stays fresh.
  const activePrices = services
    .filter((s) => s.is_active !== false && s.price > 0)
    .map((s) => s.price)
  const startingPriceSnapshot = num(detail.starting_price)
  const priceMin = activePrices.length > 0
    ? Math.min(...activePrices)
    : startingPriceSnapshot
  const priceMax = activePrices.length > 0
    ? Math.max(...activePrices)
    : startingPriceSnapshot

  // Category chips — unique categories present on active services.
  const categoryTags = Array.from(
    new Set(
      services
        .filter((s) => s.is_active !== false)
        .map((s) => s.category)
        .filter((c): c is string => typeof c === 'string' && c.length > 0),
    ),
  )

  // Banner photos — first 4 gallery URLs feed the Airbnb-style mosaic.
  const bannerGallery = gallery
    .map((g) => g.url)
    .filter((u): u is string => typeof u === 'string' && u.length > 0)
    .slice(0, 4)

  // Reviews — VendorReviewItem matches the api-client shape one-for-one.
  const reviews: VendorReviewItem[] = (detail.reviews ?? []).map((r) => ({
    id: r.id,
    author_name: r.reviewer_name ?? 'Verified Customer',
    rating: r.rating,
    comment: r.comment ?? null,
    vendor_reply: r.vendor_reply ?? null,
    created_at: r.created_at,
  }))

  // Rating histogram — computed from the embedded preview reviews. The
  // tab can also accept fresher data via an override.
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<1 | 2 | 3 | 4 | 5, number>
  for (const r of reviews) {
    const bucket = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5
    dist[bucket] += 1
  }

  const reviewSummary: VendorReviewSummary = {
    total_count: detail.review_count ?? reviews.length,
    avg_rating: num(detail.avg_rating) ?? 0,
    rating_5: dist[5],
    rating_4: dist[4],
    rating_3: dist[3],
    rating_2: dist[2],
    rating_1: dist[1],
  }

  // Vendor business-type pill copy. Reads from the shared vendor-mode meta so
  // the listing chip ("Freelancer" / "Salon") and the profile-header pill
  // stay in lockstep — change the label in one place, both surfaces update.
  const mode = vendorTypeToMode(detail.vendor_type)
  const businessTypeLabel = mode ? VENDOR_MODE_META[mode].shortLabel : null

  // For salons: `business_accounts` carries the brand-level metadata
  // (tagline, description, languages, years, social URLs, certifications,
  // logo, cover image) — the discovery query joins it in and prefixes the
  // fields with `business_*`. We coalesce so each field falls back from
  // location → brand → null, depending on which surface holds it.
  const d = detail as VendorDetail & {
    cover_url?: string | null
    business_tagline?: string | null
    business_description?: string | null
    business_logo_url?: string | null
    business_cover_image_url?: string | null
    business_website_url?: string | null
    business_instagram_url?: string | null
    business_youtube_url?: string | null
    business_specializations?: string[] | null
    business_languages?: string[] | null
    business_certifications?: unknown
    years_in_business?: number | null
    amenities?: string[] | null
  }
  const certs = Array.isArray(d.business_certifications)
    ? (d.business_certifications as Certification[])
    : []

  const profile: VendorProfile = {
    id: detail.id,
    vendor_type: detail.vendor_type as 'freelancer' | 'salon_location',
    url_slug: detail.url_slug ?? null,

    display_name: detail.display_name || detail.business_name,
    tagline: strOrNull(d.business_tagline),
    description: strOrNull(d.business_description) ?? strOrNull(detail.bio),
    primary_category: services[0]?.category ?? null,

    rating_avg: num(detail.avg_rating),
    rating_count: detail.review_count ?? 0,
    view_count: 0,
    favorite_count: 0,

    // Banner falls back: brand cover → location cover_url → first gallery
    // image. Logo falls back: brand logo → location logo.
    banner_url:
      strOrNull(d.business_cover_image_url) ??
      strOrNull(d.cover_url) ??
      strOrNull(detail.cover_image_url) ??
      bannerGallery[0] ??
      null,
    logo_url:
      strOrNull(d.business_logo_url) ?? strOrNull(detail.logo_url),
    banner_gallery: bannerGallery,

    address_full: composeAddress(detail),
    city: strOrNull(detail.city),
    // Phone intentionally null — see VendorHeader privacy note: customer
    // contact stays inside the platform until booking is confirmed.
    phone: null,
    website_url:
      strOrNull(d.business_website_url) ?? strOrNull(detail.website_url),
    instagram_url:
      strOrNull(d.business_instagram_url) ?? strOrNull(detail.instagram_url),
    youtube_url:
      strOrNull(d.business_youtube_url) ?? strOrNull(detail.youtube_url),

    is_verified: !!detail.is_verified,
    years_in_business:
      d.years_in_business ?? detail.years_of_experience ?? null,

    specializations:
      d.business_specializations ?? [],
    languages: d.business_languages ?? [],
    category_tags: categoryTags,
    amenity_keys: Array.isArray(d.amenities) ? d.amenities : [],
    certifications: certs,

    price_min: priceMin,
    price_max: priceMax,
    hourly_rate: num(detail.hourly_rate),

    business_type_label: businessTypeLabel,

    is_open_now: isOpenNow,
    today_open_time: todayRow?.open_time ?? null,
    today_close_time: todayRow?.close_time ?? null,
  }

  // Retail products — salons-only (freelancers get an empty array).
  const products: CustomerProduct[] = (detail.products ?? [])
    .filter((p) => p.is_active !== false)
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? null,
      price: num(p.price) ?? 0,
      image_url: p.image_url ?? null,
      is_active: p.is_active !== false,
      category: p.category ?? null,
      stock: typeof p.stock === 'number' ? p.stock : null,
    }))

  return { profile, services, gallery, reviews, reviewSummary, workingHours, products }
}
