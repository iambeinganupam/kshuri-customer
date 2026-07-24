"use client"

// ─────────────────────────────────────────────────────────────────────────────
// VendorProfileView — customer-facing vendor profile.
//
// Composes the SAME @kshuri/ui shared components the salon and freelancer
// dashboards render in their "Public Preview" tab, so customers see byte-for-
// byte what the vendor sees in their preview.
//
// Section order mirrors `kshuri-salon-dashboard/src/pages/PortfolioPage.tsx`
// preview tab (lines 1012–1359):
//   1. VendorBanner (cover mosaic / single-hero)
//   2. Quick stats bar (Rating · Services · Experience · Reviews)
//   3. VendorHeader (name, verified, rating, address, social, category chips)
//   4. Trending services strip
//   5. Featured services strip
//   6. Sub-tabs: Gallery / About / Services / Reviews
//   7. VendorBookingCard (sticky right rail with cart)
//   8. BookingDialog (real api-client booking flow — isPreview=false)
//   9. ServiceDetailSheet (slide-out detail with related photos)
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CUSTOMER_BOOKING_FLOW_ENABLED } from "@/lib/feature-flags"
import {
  ChevronRight,
  Grid3X3,
  Languages,
  MessageSquare,
  Package,
  Shield,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Award,
  Users,
} from "lucide-react"
// Deep-import from the profile barrel so we don't drag in `@kshuri/ui`'s
// addresses bundle (react-leaflet touches `window` at module load and explodes
// in Next 16's RSC tree-walk even behind 'use client').
import BookingDialog from "@kshuri/ui/src/components/profile/BookingDialog"
import PortfolioTab from "@kshuri/ui/src/components/profile/PortfolioTab"
import ReviewsTab from "@kshuri/ui/src/components/profile/ReviewsTab"
import ServiceDetailSheet from "@kshuri/ui/src/components/profile/ServiceDetailSheet"
import ServicesTab from "@kshuri/ui/src/components/profile/ServicesTab"
import VendorBanner from "@kshuri/ui/src/components/profile/VendorBanner"
import VendorBookingCard from "@kshuri/ui/src/components/profile/VendorBookingCard"
import VendorHeader from "@kshuri/ui/src/components/profile/VendorHeader"
import VendorAmenityStrip from "@kshuri/ui/src/components/profile/VendorAmenityStrip"
import type {
  VendorService,
  VendorReviewItem,
} from "@kshuri/ui/src/components/profile/types"
import type { GalleryItem } from "@kshuri/ui/src/components/profile/gallery/types"
import type { VendorDetail } from "@kshuri/api-client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  adaptVendorDetailToVM,
  type CustomerProduct,
} from "@/lib/content/customer-vendor-adapter"

interface VendorProfileViewProps {
  detail: VendorDetail
  /** Live review list from a paginated query — overrides the embedded
   *  preview reviews when supplied. */
  reviewsOverride?: VendorReviewItem[]
}

type SubTab = "portfolio" | "about" | "services" | "products" | "reviews"

export function VendorProfileView({
  detail,
  reviewsOverride,
}: VendorProfileViewProps) {
  const vm = useMemo(() => adaptVendorDetailToVM(detail), [detail])
  const {
    profile: vendor,
    services: vendorServices,
    gallery,
    reviewSummary,
    products,
  } = vm
  const isSalon = vendor.vendor_type === "salon_location"
  const showProductsTab = isSalon && products.length > 0

  const reviews = reviewsOverride ?? vm.reviews

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [previewSubTab, setPreviewSubTab] = useState<SubTab>("portfolio")
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    () => new Set(),
  )
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [activeService, setActiveService] = useState<VendorService | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Real booking flow. When the customer-booking-flow feature flag is on,
  // every "Book"/"Check Availability" CTA routes into the auth-gated
  // /book/<slug>/* funnel (proxy.ts redirects to /login when unauthenticated).
  // When the flag is off, we fall back to the in-page preview dialog so
  // vendor-side previews keep working.
  const router = useRouter()
  const startBooking = useCallback(() => {
    if (CUSTOMER_BOOKING_FLOW_ENABLED && detail.url_slug) {
      router.push(`/book/${detail.url_slug}/services`)
      return
    }
    setBookingDialogOpen(true)
  }, [router, detail.url_slug])

  const toggleService = useCallback((id: string) => {
    setSelectedServices((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleServiceClick = useCallback((s: VendorService) => {
    setActiveService(s)
    setSheetOpen(true)
  }, [])

  const handleBrowseServices = useCallback(() => {
    setPreviewSubTab("services")
  }, [])

  // ── Derived ────────────────────────────────────────────────────────────────
  const trendingServices = useMemo(
    () => vendorServices.filter((s) => s.trending && s.is_active !== false),
    [vendorServices],
  )
  const featuredServices = useMemo(
    () =>
      vendorServices.filter(
        (s) => s.featured && !s.trending && s.is_active !== false,
      ),
    [vendorServices],
  )

  // PortfolioTab expects `GalleryItem[]` — only service-linked photos surface
  // on the public gallery (mirrors the dashboard adapter).
  const serviceGalleryItems = useMemo<GalleryItem[]>(() => {
    return gallery
      .filter((g) => !!g.service_id)
      .map((g) => {
        const svc = vendorServices.find((s) => s.id === g.service_id)
        return {
          id: g.id,
          url: g.url,
          caption: g.caption ?? null,
          subject: {
            kind: "service" as const,
            id: g.service_id ?? "",
            name: svc?.name ?? g.service_name ?? "Service",
            categoryName: svc?.category ?? g.service_category ?? null,
            price: svc?.price ?? null,
            durationMinutes: svc?.duration_minutes ?? null,
          },
        }
      })
  }, [gallery, vendorServices])

  // Service-detail-sheet gallery — filter by selected service id.
  const sheetGalleryImages = useMemo(() => {
    if (!activeService) return []
    return gallery
      .filter((g) => g.service_id === activeService.id)
      .map((g) => ({ url: g.url, label: g.caption ?? activeService.name }))
  }, [gallery, activeService])

  // BookingDialog wants its own simplified service shape.
  const bookingDialogServices = useMemo(
    () =>
      vendorServices
        .filter((s) => s.is_active !== false)
        .map((s) => ({
          id: s.id,
          name: s.name,
          duration_minutes: s.duration_minutes,
          price: s.price,
          description: s.description,
          category: s.category,
        })),
    [vendorServices],
  )

  // Quick stats — same rules as the dashboard preview (lines 1019–1063).
  const quickStats = useMemo(() => {
    const stats: Array<{
      key: string
      icon: typeof Star
      label: string
      value: string
    }> = []
    if ((vendor.rating_avg ?? 0) > 0) {
      stats.push({
        key: "rating",
        icon: Star,
        label: "Rating",
        value: `${(vendor.rating_avg as number).toFixed(1)}/5`,
      })
    }
    if (vendorServices.length > 0) {
      stats.push({
        key: "services",
        icon: Sparkles,
        label: "Services",
        value: String(vendorServices.length),
      })
    }
    if ((vendor.years_in_business ?? 0) > 0) {
      stats.push({
        key: "experience",
        icon: Award,
        label: "Experience",
        value: `${vendor.years_in_business}+ Yrs`,
      })
    }
    if (vendor.rating_count > 0) {
      stats.push({
        key: "reviews",
        icon: Users,
        label: "Reviews",
        value: String(vendor.rating_count),
      })
    }
    return stats
  }, [vendor, vendorServices.length])

  const statsColsClass =
    quickStats.length >= 4
      ? "grid-cols-2 md:grid-cols-4"
      : quickStats.length === 3
        ? "grid-cols-3"
        : quickStats.length === 2
          ? "grid-cols-2"
          : "grid-cols-1"

  return (
    <>
      <VendorBanner vendor={vendor} ownerPreview={false} />

      {/* Quick Stats Bar — overlaps the banner bottom for a floating effect. */}
      {quickStats.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className={cn("relative z-10 -mt-6 mb-6 grid gap-3", statsColsClass)}>
            {quickStats.map((stat) => (
              <Card key={stat.key} className="border-border/40 bg-card/95 backdrop-blur-sm">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-serif text-xl font-bold">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10">
          <div className="min-w-0">
            <VendorHeader vendor={vendor} />

            {/* Amenities strip — at-a-glance facility chips (salons only). */}
            <VendorAmenityStrip amenityKeys={vendor.amenity_keys} />

            {/* Trending services — only renders when the vendor has marked any */}
            {trendingServices.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-destructive">
                  <TrendingUp className="h-4 w-4" /> Trending Services
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {trendingServices.map((s) => (
                    <Card
                      key={s.id}
                      className="cursor-pointer border-border/40 transition-shadow hover:shadow-md"
                      onClick={() => handleServiceClick(s)}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <Badge className="gap-0.5 border-0 bg-destructive/15 text-[9px] text-destructive">
                              <TrendingUp className="h-2.5 w-2.5" /> TRENDING
                            </Badge>
                            {s.featured && (
                              <Badge className="gap-0.5 border-0 bg-success/15 text-[9px] text-success">
                                <Sparkles className="h-2.5 w-2.5" /> FEATURED
                              </Badge>
                            )}
                          </div>
                          <p className="truncate text-sm font-semibold">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.duration_minutes
                              ? `${s.duration_minutes} min`
                              : "Duration TBD"}
                            {s.category ? ` · ${s.category}` : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 text-right">
                          <p className="font-serif text-lg font-bold">
                            ₹{s.price.toLocaleString("en-IN")}
                          </p>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Featured services — non-trending ones with the featured flag */}
            {featuredServices.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
                  <Sparkles className="h-4 w-4 text-primary" /> Featured Services
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {featuredServices.map((s) => (
                    <Card
                      key={s.id}
                      className="cursor-pointer border-primary/20 transition-shadow hover:shadow-md"
                      onClick={() => handleServiceClick(s)}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="min-w-0">
                          <Badge className="mb-1 gap-0.5 border-0 bg-success/15 text-[9px] text-success">
                            <Sparkles className="h-2.5 w-2.5" /> FEATURED
                          </Badge>
                          <p className="truncate text-sm font-semibold">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.duration_minutes
                              ? `${s.duration_minutes} min`
                              : "Duration TBD"}
                            {s.category ? ` · ${s.category}` : ""}
                          </p>
                        </div>
                        <p className="shrink-0 pl-3 font-serif text-lg font-bold">
                          ₹{s.price.toLocaleString("en-IN")}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <hr className="my-6 border-border/60" />

            {/* Sub-tabs — Gallery / About / Services / Reviews */}
            <Tabs
              value={previewSubTab}
              onValueChange={(v) => setPreviewSubTab(v as SubTab)}
            >
              <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border/60 bg-transparent p-0">
                {([
                  { value: "portfolio", label: "Gallery", icon: Grid3X3 },
                  { value: "about", label: "About", icon: MessageSquare },
                  { value: "services", label: "Services", icon: Tag },
                  showProductsTab
                    ? {
                        value: "products",
                        label: `Products (${products.length})`,
                        icon: Package,
                      }
                    : null,
                  {
                    value: "reviews",
                    label: `Reviews (${reviews.length})`,
                    icon: MessageSquare,
                  },
                ].filter(Boolean) as Array<{
                  value: string
                  label: string
                  icon: typeof Grid3X3
                }>).map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-3 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="portfolio" className="mt-6">
                <PortfolioTab
                  serviceItems={serviceGalleryItems}
                  onBookService={startBooking}
                />
              </TabsContent>

              <TabsContent value="about" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="mb-2 font-serif text-xl font-bold">
                      About {vendor.display_name}
                    </h2>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {vendor.description ||
                        "This vendor hasn't shared an introduction yet."}
                    </p>
                  </div>

                  {vendor.languages.length > 0 && (
                    <p className="inline-flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Languages className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">
                        Languages spoken:
                      </span>
                      <span>{vendor.languages.join(" · ")}</span>
                    </p>
                  )}

                  {vendor.certifications.length > 0 && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
                        <Shield className="h-4 w-4 text-primary" /> Certifications
                      </h3>
                      <div className="space-y-2">
                        {vendor.certifications.map((c, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 rounded-lg border border-border/40 p-2.5"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <Shield className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {c.name}
                              </p>
                              <p className="truncate text-[11px] text-muted-foreground">
                                {c.issuer} · {c.year}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="services" className="mt-6">
                <ServicesTab
                  services={vendorServices}
                  selectedServices={selectedServices}
                  onToggleService={toggleService}
                  onServiceClick={handleServiceClick}
                />
              </TabsContent>

              {showProductsTab && (
                <TabsContent value="products" className="mt-6">
                  <ProductsSection products={products} />
                </TabsContent>
              )}

              <TabsContent value="reviews" className="mt-6">
                <ReviewsTab reviews={reviews} summary={reviewSummary} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking column — sticky on desktop */}
          <div className="mt-8 lg:mt-0 lg:sticky lg:top-6 lg:self-start">
            <VendorBookingCard
              vendor={vendor}
              selectedServices={selectedServices}
              allServices={vendorServices}
              onRemoveService={toggleService}
              onBrowseServices={handleBrowseServices}
              onBookAppointment={startBooking}
              onCheckAvailability={startBooking}
            />
          </div>
        </div>
      </div>

      {/* Service detail sheet */}
      <ServiceDetailSheet
        service={activeService}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        isInCart={activeService ? selectedServices.has(activeService.id) : false}
        onToggleCart={toggleService}
        galleryImages={sheetGalleryImages}
      />

      {/* Real booking flow — calls /availability/slots via api-client */}
      <BookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        vendorId={vendor.id}
        vendorType={vendor.vendor_type}
        services={bookingDialogServices}
        preselectedServiceIds={Array.from(selectedServices)}
        isPreview={false}
      />
    </>
  )
}

// ── Products sub-tab ─────────────────────────────────────────────────────────
// Mirrors the salon dashboard's Products tab JSX (PortfolioPage.tsx lines
// 1252–1327): group by category, stock-status badge, package icon.

function ProductsSection({ products }: { products: CustomerProduct[] }) {
  const grouped = products.reduce<Record<string, CustomerProduct[]>>(
    (acc, p) => {
      const key = p.category?.trim() || "Other"
      ;(acc[key] ??= []).push(p)
      return acc
    },
    {},
  )

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {category} <span className="font-normal">({items.length})</span>
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((p) => {
              const stockBadge =
                p.stock === null
                  ? null
                  : p.stock > 10
                    ? { className: "bg-success/15 text-success", label: "In stock" }
                    : p.stock > 0
                      ? {
                          className: "bg-amber-500/15 text-amber-500",
                          label: `Only ${p.stock} left`,
                        }
                      : {
                          className: "bg-destructive/15 text-destructive",
                          label: "Out of stock",
                        }
              return (
                <Card key={p.id} className="border-border/40">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10">
                      {p.image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="shrink-0 font-serif text-base font-bold">
                          ₹{(typeof p.price === "number" ? p.price : Number(p.price)).toLocaleString("en-IN")}
                        </p>
                      </div>
                      {p.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {p.description}
                        </p>
                      )}
                      {stockBadge && (
                        <Badge className={cn("mt-2 border-0 text-[10px]", stockBadge.className)}>
                          {stockBadge.label}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
