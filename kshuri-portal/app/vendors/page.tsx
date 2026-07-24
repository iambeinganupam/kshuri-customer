"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, ChevronRight, SlidersHorizontal, List, Map as MapIcon } from "lucide-react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { VendorCard } from "@/components/vendor-card"
import { VendorFilters, VendorFiltersMobile, type FilterState } from "@/components/vendor-filters"
import { ServiceModeFilter, ServiceModeFilterHelper } from "@/components/service-mode-filter"
import { BackToTop } from "@/components/back-to-top"
import { RecentlyViewed } from "@/components/recently-viewed"
import { CompareBar } from "@/components/compare-bar"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper"
import { MapView } from "@/components/discovery/MapView"
import { useVendorList } from "@/lib/content/vendors"
import { useVendorSearchV2 } from "@kshuri/api-client"
import { useGroomingCategories } from "@/lib/content/categories"
import { modeToVendorType, type VendorModeFilter } from "@/lib/vendor-mode"
import type { Vendor } from "@/lib/types/vendor"

function VendorsContent() {
  const searchParams = useSearchParams()
  const initialCity     = searchParams.get("city")     || "all"
  const initialCategory = searchParams.get("category") || "all"
  const initialMode     = (searchParams.get("mode") as VendorModeFilter | null) ?? "all"

  const [query, setQuery] = useState("")
  const [mode, setMode] = useState<"list" | "map">("list")
  const [filters, setFilters] = useState<FilterState>({
    city: initialCity,
    category: initialCategory,
    minRating: 0,
    maxPrice: 10000000,
    sortBy: "relevance",
    serviceMode: ["all", "home", "salon"].includes(initialMode) ? initialMode : "all",
  })

  // Note: initial city/category come from URL params once at mount via the
  // useState initializer above. We deliberately do NOT re-sync on
  // searchParams change — that would overwrite the user's in-page filter
  // edits whenever the URL changed (e.g. router replace, back/forward).

  const { categories } = useGroomingCategories()

  // Map portal filter state to api-client SearchParams.
  // city is not supported by the backend search endpoint yet — kept as a
  // client-side post-filter below.
  // Service mode is filtered client-side so the segmented control's count
  // badges always reflect the true distribution (rather than dropping to 0
  // for the un-selected mode once the backend narrows the result set).
  const apiParams = useMemo(() => ({
    q:          query.trim() || undefined,
    category:   filters.category && filters.category !== "all" ? filters.category : undefined,
    min_rating: filters.minRating > 0 ? filters.minRating : undefined,
    sort_by:    filters.sortBy === "rating"      ? ("rating_desc" as const)
              : filters.sortBy === "price-low"   ? ("price_asc" as const)
              : filters.sortBy === "price-high"  ? ("price_asc" as const) // backend has no price_desc yet; best approximation
              : ("distance" as const),
    limit:      50,
  }), [query, filters.category, filters.minRating, filters.sortBy])

  const list = useVendorList(apiParams)

  // v2 search — fired only when the map tab is active. Provides lat/lng on
  // every result so MapView can render real pins. Kept parallel to the legacy
  // useVendorList hook (which powers the list view) to avoid touching list
  // rendering in this surgical change.
  const v2Query = useVendorSearchV2(
    {
      q:          query.trim() || undefined,
      category:   filters.category !== "all" ? filters.category : undefined,
      min_rating: filters.minRating > 0 ? filters.minRating : undefined,
      sort_by:    "distance",
      limit:      50,
    },
    mode === "map",
  )

  const v2Items = useMemo(
    () => v2Query.data?.pages.flatMap((p) => p.items) ?? [],
    [v2Query.data],
  )

  const mapPins = useMemo(
    () =>
      v2Items
        .filter((v) => v.lat !== null && v.lng !== null)
        .map((v) => ({
          id:   v.id,
          slug: v.slug,
          name: v.name,
          lat:  v.lat!,
          lng:  v.lng!,
        })),
    [v2Items],
  )

  // Two-stage client-side filter:
  //   1. Filter by city (backend doesn't accept it yet).
  //   2. Compute mode counts from (1) so the segmented control shows the
  //      true distribution under the user's other filters.
  //   3. Apply the service-mode filter on top to produce the final list.
  const cityFiltered = useMemo<Vendor[]>(() => {
    const all = list.vendors
    if (!filters.city || filters.city === "all") return all
    return all.filter((v) => v.city.toLowerCase().includes(filters.city.toLowerCase()))
  }, [list.vendors, filters.city])

  const modeCounts = useMemo(() => {
    let home = 0, salon = 0
    for (const v of cityFiltered) {
      if (v.vendorType === "freelancer") home += 1
      else if (v.vendorType === "salon_location") salon += 1
    }
    return { all: cityFiltered.length, home, salon }
  }, [cityFiltered])

  const filtered = useMemo<Vendor[]>(() => {
    if (filters.serviceMode === "all") return cityFiltered
    const target = modeToVendorType(filters.serviceMode)
    return cityFiltered.filter((v) => v.vendorType === target)
  }, [cityFiltered, filters.serviceMode])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ─── Header ─── */}
        {/* Mobile: minimal title + search. Desktop: full gradient hero */}
        <section className="bg-gradient-to-br from-primary/5 to-gold/5 px-4 pt-5 pb-4 md:pt-12 md:pb-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            {/* Breadcrumb — desktop only */}
            <FadeIn delay={0.05} className="hidden md:block">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground">Vendors</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.05}>
              <h1 className="mt-0 md:mt-3 font-serif text-xl font-bold text-foreground sm:text-4xl">
                Find a vendor
              </h1>
              <p className="hidden sm:block mt-1.5 max-w-xl text-sm text-muted-foreground leading-relaxed">
                Search across all categories to find the right grooming professional for you.
              </p>
            </FadeIn>

            {/* Search */}
            <FadeIn delay={0.1} className="relative mt-3 max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search vendors, cities, categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-11 bg-card border-border/60 shadow-sm rounded-xl"
              />
            </FadeIn>

            {/* Service-mode segmented filter — Swiggy Dineout-style toggle.
                "Home Service" surfaces freelancers (artist comes to you);
                "At Salon" surfaces salon_locations (you visit the venue). */}
            <FadeIn delay={0.15} className="mt-4 flex flex-col gap-1.5">
              <ServiceModeFilter
                value={filters.serviceMode}
                onChange={(v) => setFilters((f) => ({ ...f, serviceMode: v }))}
                counts={modeCounts}
              />
              <ServiceModeFilterHelper value={filters.serviceMode} className="ml-1" />
            </FadeIn>
          </div>
        </section>

        {/* ─── Category Chips (mobile quick-filter) ─── */}
        <section className="border-b border-border/40 bg-background px-4 py-3 lg:hidden">
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setFilters((f) => ({ ...f, category: "all" }))}
              className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filters.category === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-card text-foreground hover:border-primary/40"
              }`}
            >
              All
            </motion.button>
            {categories.map((cat) => (
              <motion.button
                key={cat.slug}
                whileTap={{ scale: 0.94 }}
                onClick={() => setFilters((f) => ({ ...f, category: cat.slug }))}
                className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  filters.category === cat.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 bg-card text-foreground hover:border-primary/40"
                }`}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>
        </section>

        {/* ─── Results + Desktop Sidebar ─── */}
        <section className="px-4 py-6 lg:py-14">
          <div className="mx-auto flex max-w-7xl gap-8">

            {/* Desktop-only sidebar (self-start, sticky) */}
            <VendorFilters filters={filters} onFilterChange={setFilters} showCategory />

            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground shrink-0">
                  <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
                  vendor{filtered.length !== 1 ? "s" : ""} found
                </p>
                <div className="flex items-center gap-2">
                  {/* List/Map mode toggle */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant={mode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMode("list")}
                      aria-pressed={mode === "list"}
                    >
                      <List className="h-4 w-4" aria-hidden /> List
                    </Button>
                    <Button
                      variant={mode === "map" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMode("map")}
                      aria-pressed={mode === "map"}
                    >
                      <MapIcon className="h-4 w-4" aria-hidden /> Map
                    </Button>
                  </div>
                  {/* Mobile-only filter button */}
                  <VendorFiltersMobile filters={filters} onFilterChange={setFilters} showCategory />
                </div>
              </div>

              {mode === "map" ? (
                <div className="h-[600px] w-full">
                  <MapView
                    items={mapPins}
                    center={mapPins[0] ? { lat: mapPins[0].lat, lng: mapPins[0].lng } : { lat: 19.076, lng: 72.877 }}
                    onPinClick={(id) => {
                      const v = v2Items.find((x) => x.id === id)
                      if (v?.slug) window.location.href = `/vendors/${v.slug}`
                    }}
                  />
                </div>
              ) : list.isLoading ? (
                <div className="grid grid-cols-1 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-36 animate-pulse rounded-xl bg-muted/50" />
                  ))}
                </div>
              ) : filtered.length > 0 ? (
                <StaggerContainer
                  staggerDelay={0.04}
                  className="grid grid-cols-1 gap-3"
                >
                  {filtered.map((vendor) => (
                    <StaggerItem key={vendor.id}>
                      <VendorCard vendor={vendor} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <FadeIn className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                    <Search className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">No vendors found</h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Try adjusting your search query or filters.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setQuery("")
                      setFilters({ city: "all", category: "all", minRating: 0, maxPrice: 10000000, sortBy: "relevance", serviceMode: "all" })
                    }}
                    className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Clear all filters
                  </motion.button>
                </FadeIn>
              )}
            </div>
          </div>

          <RecentlyViewed className="mt-8" />
        </section>
      </main>

      <Footer />
      <BackToTop />
      <CompareBar />
    </div>
  )
}

export default function VendorsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <VendorsContent />
    </Suspense>
  )
}
