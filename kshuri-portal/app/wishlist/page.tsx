"use client"

import Link from "next/link"
import { ChevronRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { VendorCard } from "@/components/vendor-card"
import { BackToTop } from "@/components/back-to-top"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper"
import { useWishlist } from "@/hooks/use-wishlist"
import { useVendorList } from "@/lib/content/vendors"
import { EmptyState } from "@/components/empty-state"
import { SkeletonCard } from "@/components/skeleton-card"
import type { Vendor } from "@/lib/types/vendor"

export default function WishlistPage() {
  const { ids, clear } = useWishlist()
  const { vendors: allVendors, isLoading } = useVendorList({ limit: 50 })
  const saved = allVendors.filter((v) => ids.includes(v.id))

  // Group by category
  const grouped = saved.reduce<Record<string, Vendor[]>>((acc, v) => {
    if (!acc[v.category]) acc[v.category] = []
    acc[v.category].push(v)
    return acc
  }, {})

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 to-gold/5 px-4 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <FadeIn>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground">Wishlist</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                    Your Wishlist
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    {saved.length} vendor{saved.length !== 1 ? "s" : ""} saved
                  </p>
                </div>
                {saved.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clear}
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear All
                  </Button>
                )}
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="px-4 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SkeletonCard count={3} />
              </div>
            ) : saved.length === 0 ? (
              <EmptyState
                title="Your wishlist is empty"
                description="Save vendors you love to revisit them later."
                ctaLabel="Browse vendors"
                ctaHref="/vendors"
              />
            ) : (
              <div className="flex flex-col gap-10">
                {Object.entries(grouped).map(([category, vendors]) => (
                  <div key={category}>
                    <FadeIn>
                      <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
                        {category}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          ({vendors.length})
                        </span>
                      </h2>
                    </FadeIn>
                    <StaggerContainer
                      staggerDelay={0.06}
                      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {vendors.map((vendor) => (
                        <StaggerItem key={vendor.id}>
                          <VendorCard vendor={vendor} />
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
