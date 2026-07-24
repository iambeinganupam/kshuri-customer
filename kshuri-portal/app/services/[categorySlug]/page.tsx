"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { VendorCard } from "@/components/vendor-card"
import { VendorFilters, type FilterState } from "@/components/vendor-filters"
import { ServiceModeFilter, ServiceModeFilterHelper } from "@/components/service-mode-filter"
import { BackToTop } from "@/components/back-to-top"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper"
import { useCategoryBySlug } from "@/lib/content/categories"
import { useVendorList } from "@/lib/content/vendors"
import { EmptyState } from "@/components/empty-state"
import { SkeletonCard } from "@/components/skeleton-card"
import { modeToVendorType } from "@/lib/vendor-mode"
import type { Vendor } from "@/lib/types/vendor"
// Deep import to avoid pulling the leaflet-dependent address modules into
// the SSR bundle (the root @kshuri/ui barrel evaluates them at module-load).
import { ServiceCategoryBreadcrumb } from "@kshuri/ui/src/components/service-category"

function sortVendors(vendors: Vendor[], sortBy: string): Vendor[] {
  const sorted = [...vendors]
  switch (sortBy) {
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating)
    case "price-low":
      return sorted.sort((a, b) => a.priceMin - b.priceMin)
    case "price-high":
      return sorted.sort((a, b) => b.priceMax - a.priceMax)
    case "bookings":
      return sorted.sort((a, b) => b.bookings - a.bookings)
    default:
      return sorted
  }
}

export default function CategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const cat = useCategoryBySlug(categorySlug)

  const [filters, setFilters] = useState<FilterState>({
    city: "all",
    category: "all",
    minRating: 0,
    maxPrice: 10000000,
    sortBy: "relevance",
    serviceMode: "all",
  })

  // Service mode is filtered client-side (see /vendors page for rationale —
  // keeps the segmented control's count badges accurate regardless of which
  // mode the user has currently selected).
  const list = useVendorList(
    { category: cat.category?.id, limit: 24 },
    !!cat.category,
  )
  const category = cat.category
  const vendors = list.vendors

  const filtered = useMemo(() => {
    let result = [...vendors]
    if (filters.city && filters.city !== "all") {
      result = result.filter((v) => v.city === filters.city)
    }
    if (filters.minRating > 0) {
      result = result.filter((v) => v.rating >= filters.minRating)
    }
    if (filters.serviceMode !== "all") {
      const target = modeToVendorType(filters.serviceMode)
      result = result.filter((v) => v.vendorType === target)
    }
    return sortVendors(result, filters.sortBy)
  }, [vendors, filters])

  // Counts for the segmented filter — computed off the city/rating-filtered
  // pre-mode list so badges show the true distribution at the user's other
  // narrowing choices.
  const modeCounts = useMemo(() => {
    let home = 0, salon = 0
    const base = vendors
      .filter((v) =>
        filters.city === "all" ? true : v.city === filters.city,
      )
      .filter((v) =>
        filters.minRating > 0 ? v.rating >= filters.minRating : true,
      )
    for (const v of base) {
      if (v.vendorType === "freelancer") home += 1
      else if (v.vendorType === "salon_location") salon += 1
    }
    return { all: base.length, home, salon }
  }, [vendors, filters.city, filters.minRating])

  if (cat.isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <section className="bg-gradient-to-br from-primary/5 to-gold/5 px-4 py-12 lg:py-16">
            <div className="mx-auto max-w-7xl">
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-10 w-72 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-4 w-96 animate-pulse rounded bg-muted" />
            </div>
          </section>
          <section className="px-4 py-10 lg:py-14">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <SkeletonCard count={6} />
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <EmptyState
            title="Category not found"
            description="The category you are looking for does not exist."
            ctaLabel="Browse all services"
            ctaHref="/services"
          />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Category Hero */}
        <section className="bg-gradient-to-br from-primary/5 to-gold/5 px-4 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <FadeIn>
              <ServiceCategoryBreadcrumb
                root={{ label: category.name }}
                renderLink={({ href, children, className }) => (
                  <Link href={href} className={className}>
                    {children}
                  </Link>
                )}
                className="text-sm"
              />
              {/* The Next.js <Link> escape hatch above keeps prefetch + client-side
                  navigation behaviour; ServiceCategoryBreadcrumb renders the trail
                  styling and the active-page semantics. */}
              <h1 className="mt-4 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                {category.name}
              </h1>
              <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
                {category.description}
              </p>
              <p className="mt-2 text-sm font-medium text-primary">
                {vendors.length} vendors available
              </p>

              {/* Service-mode toggle — surfaces the Home/At-Salon split right
                  under the hero so customers can split the catalog before
                  scanning any cards. */}
              <div className="mt-5 flex flex-col gap-1.5">
                <ServiceModeFilter
                  value={filters.serviceMode}
                  onChange={(v) => setFilters((f) => ({ ...f, serviceMode: v }))}
                  counts={modeCounts}
                />
                <ServiceModeFilterHelper value={filters.serviceMode} className="ml-1" />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Vendors */}
        <section className="px-4 py-10 lg:py-14">
          <div className="mx-auto flex max-w-7xl gap-8">
            <VendorFilters filters={filters} onFilterChange={setFilters} />

            <div className="flex-1">
              {/* Mobile filter + result count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filtered.length} vendor{filtered.length !== 1 ? "s" : ""} found
                </p>
                <div className="lg:hidden">
                  <VendorFilters
                    filters={filters}
                    onFilterChange={setFilters}
                  />
                </div>
              </div>

              {list.isLoading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  <SkeletonCard count={6} />
                </div>
              ) : filtered.length > 0 ? (
                <StaggerContainer
                  staggerDelay={0.06}
                  className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {filtered.map((vendor) => (
                    <StaggerItem key={vendor.id}>
                      <VendorCard vendor={vendor} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <EmptyState
                  title="No vendors in this category yet"
                  description="Try adjusting your filters or check back soon."
                  ctaLabel="Browse all vendors"
                  ctaHref="/vendors"
                />
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
