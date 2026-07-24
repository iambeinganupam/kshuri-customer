'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Customer-portal category adapter — converts the @kshuri/api-client
// ServiceCategory shape into the portal's Category view-model.
//
// As of migration 073 the backend provides `slug`, `description`, and `icon`
// on every category row, so the portal no longer derives slugs client-side
// (which would break the moment an admin renamed a category). The legacy
// fallbacks below stay as belt-and-braces for the brief window between when
// a custom category is created and the next homepage refresh.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useServiceCategories,
  useCategoryBySlug as useApiCategoryBySlug,
} from '@kshuri/api-client'
import type { ServiceCategory } from '@kshuri/api-client/types'
import type { Category } from '@/lib/types/vendor'

function deriveSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function toViewModel(c: ServiceCategory): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug ?? deriveSlug(c.name),
    description: c.description ?? '',
    // The DB icon column holds a lucide icon name. The legacy `icon_url`
    // column is kept around for migrated rows that pointed at a hosted
    // image. CategoryCard's iconMap resolves the lucide name; the URL
    // falls through to its default icon if both are empty.
    icon: c.icon ?? c.icon_url ?? '',
    vendorCount: c.vendor_count ?? 0,
  }
}

/** Categories from the backend, adapted to the portal's Category view-model. */
export function useGroomingCategories() {
  const q = useServiceCategories()
  const items: Category[] = (q.data ?? []).map(toViewModel)
  return { ...q, categories: items }
}

/**
 * Resolve a single root category by slug via the backend's DB-backed
 * `/discover/categories/:slug` endpoint. Replaces the previous client-side
 * scan, so renames + new categories don't require a portal redeploy.
 *
 * The returned shape mirrors the rest of the file (`{ ...q, category }`)
 * so existing call sites keep working without changes.
 */
export function useCategoryBySlug(slug: string) {
  const q = useApiCategoryBySlug(slug)
  const category = q.data ? toViewModel(q.data) : null
  return { ...q, category }
}
