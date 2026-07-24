"use client"

import { SlidersHorizontal, Star, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useGroomingCategories } from "@/lib/content/categories"
import type { VendorModeFilter } from "@/lib/vendor-mode"

// Cities: backend doesn't expose a /cities endpoint yet. Hardcoded for now —
// will move to a /meta/cities endpoint in a future spec.
const CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Udaipur'] as const
import { cn } from "@/lib/utils"

export interface FilterState {
  city: string
  category: string
  minRating: number
  maxPrice: number
  sortBy: string
  serviceMode: VendorModeFilter
}

const sortOptions = [
  { value: "relevance",  label: "Relevance" },
  { value: "rating",     label: "Highest Rated" },
  { value: "price-low",  label: "Price: Low → High" },
  { value: "price-high", label: "Price: High → Low" },
  { value: "bookings",   label: "Most Booked" },
]

const DEFAULT_FILTERS: FilterState = {
  city: "all", category: "all", minRating: 0, maxPrice: 10000000, sortBy: "relevance",
  serviceMode: "all",
}

function activeCount(filters: FilterState) {
  return [
    filters.city !== "all",
    filters.category !== "all",
    filters.minRating > 0,
    filters.sortBy !== "relevance",
    filters.serviceMode !== "all",
  ].filter(Boolean).length
}

function FilterBody({
  filters,
  onFilterChange,
  showCategory,
}: {
  filters: FilterState
  onFilterChange: (f: FilterState) => void
  showCategory?: boolean
}) {
  const { categories } = useGroomingCategories()
  const cities = CITIES
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        {/* Service type (Freelancers vs Salons) lives in the page hero as a
            prominent segmented control — not duplicated here. The sidebar
            keeps the more granular filters that don't fit the hero. */}

        {/* City */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">City</label>
          <Select value={filters.city} onValueChange={(v) => onFilterChange({ ...filters, city: v })}>
            <SelectTrigger className="border-border/60 bg-background h-11">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        {showCategory && (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
            <Select value={filters.category} onValueChange={(v) => onFilterChange({ ...filters, category: v })}>
              <SelectTrigger className="border-border/60 bg-background h-11">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Min Rating */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Min Rating</label>
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Star className="h-3 w-3 fill-primary" />
              {filters.minRating > 0 ? `${filters.minRating}+` : "Any"}
            </span>
          </div>
          <Slider
            value={[filters.minRating]}
            onValueChange={([v]) => onFilterChange({ ...filters, minRating: v })}
            min={0} max={5} step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Any</span><span>5★</span>
          </div>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort By</label>
          <div className="flex flex-col gap-1.5">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFilterChange({ ...filters, sortBy: opt.value })}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-all",
                  filters.sortBy === opt.value
                    ? "border-primary bg-primary/8 text-primary"
                    : "border-border/50 text-foreground hover:border-primary/30 hover:bg-secondary/50"
                )}
              >
                {opt.label}
                {filters.sortBy === opt.value && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 px-5 py-4">
        <Button
          variant="outline"
          onClick={() => onFilterChange(DEFAULT_FILTERS)}
          className="w-full h-11"
          disabled={activeCount(filters) === 0}
        >
          {activeCount(filters) > 0 ? `Clear filters (${activeCount(filters)})` : "No active filters"}
        </Button>
      </div>
    </div>
  )
}

interface VendorFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  showCategory?: boolean
  className?: string
}

/** Desktop-only sticky sidebar — renders nothing on mobile */
export function VendorFilters({ filters, onFilterChange, showCategory = false, className }: VendorFiltersProps) {
  const count = activeCount(filters)
  return (
    <aside className={cn("hidden w-64 shrink-0 self-start lg:block", className)}>
      <div className="sticky top-24 rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <h3 className="font-serif text-lg font-semibold text-card-foreground">Filters</h3>
          {count > 0 && (
            <button
              onClick={() => onFilterChange(DEFAULT_FILTERS)}
              className="text-xs text-primary hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        <FilterBody filters={filters} onFilterChange={onFilterChange} showCategory={showCategory} />
      </div>
    </aside>
  )
}

/** Mobile-only filter button + bottom sheet — renders nothing on desktop */
export function VendorFiltersMobile({ filters, onFilterChange, showCategory = false }: VendorFiltersProps) {
  const count = activeCount(filters)
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
              count > 0
                ? "border-primary bg-primary/8 text-primary"
                : "border-border/60 bg-card text-foreground hover:border-primary/30"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {count > 0 && (
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </motion.button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[88vh] p-0 rounded-t-2xl flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/50 shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-serif text-xl">Filters</SheetTitle>
              {count > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {count} active
                </span>
              )}
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <FilterBody filters={filters} onFilterChange={onFilterChange} showCategory={showCategory} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
