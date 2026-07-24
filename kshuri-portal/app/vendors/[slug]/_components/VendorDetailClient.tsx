"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { VendorCard } from "@/components/vendor-card"
import { BackToTop } from "@/components/back-to-top"
import { VendorProfileView } from "@/components/vendor-profile-view"
import {
  useVendor,
  useVendorReviewsForSlug,
  useVendorList,
} from "@/lib/content/vendors"

export function VendorDetailClient({ slug }: { slug: string }) {
  const vendorQ = useVendor(slug)
  const vendor = vendorQ.vendor
  const detail = vendorQ.detail

  // Live, paginated reviews — overrides the embedded preview reviews on
  // VendorDetail so the Reviews tab always reflects the latest state.
  const reviewsQ = useVendorReviewsForSlug(vendor?.id ?? "", 20)
  const reviewsForTab = reviewsQ.reviews.map((r) => ({
    id: r.id,
    author_name: r.author || "Verified Customer",
    rating: r.rating,
    comment: r.comment ?? null,
    vendor_reply: null,
    created_at: r.date,
  }))

  // Similar vendors carousel — same category, excluding current.
  const relatedQ = useVendorList(
    { category: detail?.services?.[0]?.category ?? undefined, limit: 6 },
    !!detail,
  )
  const similarVendors = relatedQ.vendors.filter((v) => v.id !== vendor?.id)

  if (vendorQ.isLoading) return <ProfileSkeleton />
  if (!detail || !vendor) return <VendorNotFound />

  const categoryLabel = detail.services?.[0]?.category ?? "Vendors"
  const categorySlug =
    vendor.categorySlug || categoryLabel.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="bg-secondary/30 px-4 py-3">
          <nav
            aria-label="Breadcrumb"
            className="mx-auto flex max-w-7xl items-center gap-2 text-sm text-muted-foreground"
          >
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link href="/services" className="hover:text-foreground">Services</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link
              href={`/services/${categorySlug}`}
              className="hover:text-foreground"
            >
              {categoryLabel}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1 text-foreground">{vendor.name}</span>
          </nav>
        </div>

        <VendorProfileView detail={detail} reviewsOverride={reviewsForTab} />

        {similarVendors.length > 0 && (
          <section className="bg-secondary/30 px-4 py-12 lg:py-16">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-8 font-serif text-2xl font-bold text-foreground">
                Similar {categoryLabel} Vendors
              </h2>
              <Carousel opts={{ align: "start", loop: true }} className="w-full">
                <CarouselContent className="-ml-4">
                  {similarVendors.map((v) => (
                    <CarouselItem
                      key={v.id}
                      className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3"
                    >
                      <VendorCard vendor={v} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-4 hidden sm:flex" />
                <CarouselNext className="-right-4 hidden sm:flex" />
              </Carousel>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="h-56 w-full animate-pulse bg-secondary sm:h-72 lg:h-80" />
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl bg-muted/50"
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function VendorNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Vendor Not Found
          </h1>
          <p className="mt-2 text-muted-foreground">
            The vendor profile you are looking for does not exist.
          </p>
          <Link
            href="/vendors"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Browse All Vendors
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
