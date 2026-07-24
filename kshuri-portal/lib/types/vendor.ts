// ─────────────────────────────────────────────────────────────────────────────
// Portal Domain Types — view-model shape for the customer portal.
// These are kept distinct from `@kshuri/api-client`'s wire types so backend
// changes don't ripple into the portal's component prop shapes without an
// explicit adapter update in lib/content/.
// ─────────────────────────────────────────────────────────────────────────────

export interface Vendor {
  id: string
  name: string
  slug: string
  category: string
  categorySlug: string
  subcategory: string
  description: string
  longDescription: string
  city: string
  area: string
  priceMin: number
  priceMax: number
  priceUnit: string
  rating: number
  reviewCount: number
  tags: string[]
  featured: boolean
  verified: boolean
  experience: number
  bookings: number
  availability: boolean
  /** Backend vendor_type discriminator. Null when not exposed on the source
   *  payload — UI components must degrade gracefully. */
  vendorType: 'freelancer' | 'salon_location' | null
  /** Cover photo — used on vendor cards when present. Falls back to a
   *  branded gradient + initials watermark when null. */
  coverImageUrl: string | null
  /** Logo / profile picture. */
  logoUrl: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  vendorCount: number
}

export interface Review {
  id: string
  vendorId: string
  author: string
  rating: number
  comment: string
  date: string
  eventType: string
}

export interface Testimonial {
  id: string
  name: string
  location: string
  comment: string
  rating: number
  eventType: string
}

export interface ServiceItem {
  name: string
  price: string
  description: string
}

export interface PortfolioItem {
  id: string
  /** Real image URL when available; if absent the UI falls back to a
   *  gradient placeholder (legacy behavior). */
  imageUrl?: string | null
  caption: string
  likes: number
  event: string
  location: string
  aspectRatio: 'square' | 'portrait' | 'landscape'
}

export interface TimeSlot {
  id: string
  label: string
  time: string
  available: boolean
}

export interface BookingPackage {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
}
