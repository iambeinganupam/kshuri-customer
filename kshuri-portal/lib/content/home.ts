'use client'

import {
  usePublicStats,
  useFeaturedVendors,
  useTrendingVendors,
  useTestimonials,
  useCallouts,
} from '@kshuri/api-client'
import { adaptVendor } from '@/lib/content/vendors'
import type { Testimonial } from '@/lib/types/vendor'

/** Homepage hero counters. */
export function useHomeStats() {
  return usePublicStats()
}

/** Homepage hero copy + CTAs. Returns a lookup keyed by callout `key`. */
export function useHomeHero() {
  const q = useCallouts('homepage')
  // useCallouts returns PlatformCallout[] — filter out rows with no key before mapping
  const byKey = new Map((q.data ?? []).filter((c) => c.key).map((c) => [c.key!, c]))
  return {
    ...q,
    title:        byKey.get('hero_title')?.text,
    subtitle:     byKey.get('hero_subtitle')?.text,
    ctaPrimary:   byKey.get('hero_cta_primary'),
    ctaSecondary: byKey.get('hero_cta_secondary'),
    vendorCta:    byKey.get('vendor_cta'),
  }
}

/** Homepage "How it works" steps — context-only callouts, ordered. */
export function useHomeHowItWorks() {
  const q = useCallouts('homepage_how_it_works')
  return { ...q, steps: q.data ?? [] }
}

/** Featured vendors carousel — adapted to the portal Vendor shape.
 *  useFeaturedVendors returns VendorSearchResult[] (not paginated). */
export function useHomeFeatured(limit = 6) {
  const q = useFeaturedVendors({ limit })
  return { ...q, vendors: (q.data ?? []).map(adaptVendor) }
}

/** Trending vendors carousel — adapted to the portal Vendor shape.
 *  useTrendingVendors returns VendorSearchResult[] (not paginated). */
export function useHomeTrending(limit = 6) {
  const q = useTrendingVendors({ limit })
  return { ...q, vendors: (q.data ?? []).map(adaptVendor) }
}

/** Testimonial carousel — adapts api-client's Testimonial → portal Testimonial.
 *  useTestimonials returns Testimonial[] (not paginated). */
export function useHomeTestimonials(limit = 10) {
  const q = useTestimonials({ limit })
  const items: Testimonial[] =
    (q.data ?? []).map((t) => ({
      id:        t.id,
      name:      t.customer_name,
      location:  t.customer_city,
      comment:   t.quote,
      rating:    t.rating,
      eventType: '',
    }))
  return { ...q, testimonials: items }
}
