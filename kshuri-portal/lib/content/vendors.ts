'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Vendor content orchestrators — adapts @kshuri/api-client's wire types to
// the portal's Vendor view-model so existing components don't need rewrites.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useVendorSearch,
  useVendorBySlug,
  useVendorReviews,
  type SearchParams,
  type VendorSearchResult,
  type VendorDetail,
} from '@kshuri/api-client'
import type { Vendor, Review } from '@/lib/types/vendor'

/** Convert a single backend search result to the portal's Vendor view-model.
 *  Fields the backend doesn't carry (subcategory, longDescription, tags,
 *  bookings, area, priceMax) are filled with safe defaults — the UI degrades
 *  gracefully because each consumer already null-checks. */
export function adaptVendor(row: VendorSearchResult): Vendor {
  // Backend returns numeric/decimal fields as strings (Postgres pg driver
  // default for NUMERIC). Coerce to number so the UI's <PriceDisplay /> and
  // <StarRating /> can do arithmetic safely.
  const rating = row.avg_rating == null ? 0 : Number(row.avg_rating)
  const price  = row.starting_price == null ? 0 : Number(row.starting_price)
  const rawCategory = row.primary_category ?? ''
  // Backend may return snake_case slugs ("hair_styling") — humanise for display
  // while preserving the original for the slug.
  const primaryCategory = rawCategory
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
  return {
    id:           row.id,
    name:         row.display_name || row.business_name,
    slug:         row.url_slug ?? '',
    category:     primaryCategory,
    categorySlug: rawCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    subcategory:  '',
    description:  '',
    longDescription: '',
    city:         row.city ?? '',
    area:         '',
    priceMin:     price,
    priceMax:     price,
    priceUnit:    '',
    rating,
    reviewCount:  row.review_count ?? 0,
    tags:         [],
    featured:     false,
    verified:     true,
    experience:   0,
    bookings:     0,
    availability: true,
    vendorType:   row.vendor_type ?? null,
    coverImageUrl: row.cover_image_url ?? null,
    logoUrl:       row.logo_url ?? null,
  }
}

/** Backend's deep VendorDetail → portal Vendor view-model. */
export function adaptVendorDetail(detail: VendorDetail): Vendor {
  // Service prices come as NUMERIC strings ("6000.00"). Coerce.
  const servicePrices = (detail.services ?? [])
    .map((s) => Number(s.price))
    .filter((n) => Number.isFinite(n) && n > 0)
  const startingPrice = detail.starting_price != null
    ? Number(detail.starting_price)
    : servicePrices[0] ?? 0
  const maxPrice = servicePrices.length ? Math.max(...servicePrices) : startingPrice
  const minPrice = servicePrices.length ? Math.min(...servicePrices) : startingPrice

  return {
    id:           detail.id,
    name:         detail.display_name || detail.business_name,
    slug:         detail.url_slug ?? '',
    category:     detail.services?.[0]?.category ?? '',
    categorySlug: detail.services?.[0]?.category?.toLowerCase().replace(/\s+/g, '-') ?? '',
    subcategory:  '',
    description:  detail.bio ?? '',
    longDescription: detail.bio ?? '',
    city:         detail.city ?? '',
    area:         '',
    priceMin:     minPrice,
    priceMax:     maxPrice,
    priceUnit:    '',
    rating:       detail.avg_rating == null ? 0 : Number(detail.avg_rating),
    reviewCount:  detail.review_count ?? 0,
    tags:         [],
    featured:     false,
    verified:     detail.is_verified ?? true,
    experience:   detail.years_of_experience ?? 0,
    bookings:     0,
    availability: true,
    vendorType:   detail.vendor_type ?? null,
    coverImageUrl: detail.cover_image_url ?? null,
    logoUrl:       detail.logo_url ?? null,
  }
}

/** Portal hook: search/list vendors. Wraps useVendorSearch with view-model. */
export function useVendorList(params: SearchParams, enabled = true) {
  const q = useVendorSearch(params, enabled)
  return {
    ...q,
    vendors: q.data?.items.map(adaptVendor) ?? [],
    hasMore: q.data?.has_more ?? false,
  }
}

/** Portal hook: fetch a single vendor by slug, adapt to view-model. */
export function useVendor(slug: string) {
  const q = useVendorBySlug(slug)
  return {
    ...q,
    vendor: q.data ? adaptVendorDetail(q.data) : null,
    detail: q.data ?? null,
  }
}

/** Portal hook: a vendor's reviews as the Review view-model. */
export function useVendorReviewsForSlug(vendorId: string, limit = 10) {
  const q = useVendorReviews(vendorId, { limit })
  const items: Review[] =
    q.data?.items.map((r) => ({
      id:        r.id,
      vendorId,
      author:    r.customer_name,
      rating:    r.rating,
      comment:   r.comment ?? '',
      date:      r.created_at,
      eventType: '',
    })) ?? []
  return { ...q, reviews: items, hasMore: q.data?.has_more ?? false }
}
