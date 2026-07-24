"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BackToTop } from "@/components/back-to-top"
import { StarRating } from "@/components/star-rating"
import { PriceDisplay } from "@/components/price-display"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper"
import { useVendorList } from "@/lib/content/vendors"
import { formatINR } from "@/lib/format"
import { SkeletonCard } from "@/components/skeleton-card"

function ComparePageContent() {
  const searchParams = useSearchParams()
  const idParam = searchParams.get("ids") || ""
  const idList = idParam.split(",").filter(Boolean)
  const { vendors: allVendors, isLoading } = useVendorList({ limit: 50 })
  const selected = allVendors.filter((v) => idList.includes(v.id))

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 px-4 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonCard count={3} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (selected.length < 2) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4">
          <FadeIn className="text-center">
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Not Enough Vendors to Compare
            </h1>
            <p className="mt-2 text-muted-foreground">
              Select at least 2 vendors to compare them side-by-side.
            </p>
            <Link href="/vendors" className="mt-6 inline-block">
              <Button className="gap-1 bg-primary text-primary-foreground">
                <ArrowLeft className="h-4 w-4" /> Browse Vendors
              </Button>
            </Link>
          </FadeIn>
        </main>
        <Footer />
      </div>
    )
  }

  const rows: { label: string; render: (v: (typeof selected)[0]) => React.ReactNode }[] = [
    {
      label: "Category",
      render: (v) => (
        <Badge variant="secondary" className="text-xs">
          {v.category}
        </Badge>
      ),
    },
    {
      label: "Rating",
      render: (v) => (
        <div className="flex items-center gap-1">
          <StarRating rating={v.rating} size="sm" showValue />
          <span className="text-xs text-muted-foreground">({v.reviewCount})</span>
        </div>
      ),
    },
    {
      label: "Price Range",
      render: (v) => (
        <span className="text-sm font-semibold text-foreground">
          {formatINR(v.priceMin)} – {formatINR(v.priceMax)}
          <span className="ml-1 text-xs font-normal text-muted-foreground">{v.priceUnit}</span>
        </span>
      ),
    },
    {
      label: "City",
      render: (v) => (
        <span className="text-sm text-foreground">
          {v.area}, {v.city}
        </span>
      ),
    },
    {
      label: "Experience",
      render: (v) => <span className="text-sm text-foreground">{v.experience}+ years</span>,
    },
    {
      label: "Bookings",
      render: (v) => <span className="text-sm text-foreground">{v.bookings.toLocaleString("en-IN")}+</span>,
    },
    {
      label: "Availability",
      render: (v) => (
        <Badge variant={v.availability ? "default" : "secondary"} className={v.availability ? "bg-green-600 text-white text-xs" : "text-xs"}>
          {v.availability ? "Available" : "Busy"}
        </Badge>
      ),
    },
    {
      label: "Verified",
      render: (v) => (
        <Badge variant={v.verified ? "default" : "secondary"} className={v.verified ? "bg-primary text-primary-foreground text-xs" : "text-xs"}>
          {v.verified ? "✓ Verified" : "Not Verified"}
        </Badge>
      ),
    },
    {
      label: "Speciality",
      render: (v) => <span className="text-sm text-foreground">{v.subcategory}</span>,
    },
    {
      label: "Tags",
      render: (v) => (
        <div className="flex flex-wrap gap-1">
          {v.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
  ]

  // Highlight best values
  const bestRating = Math.max(...selected.map((v) => v.rating))
  const lowestPrice = Math.min(...selected.map((v) => v.priceMin))
  const mostExperience = Math.max(...selected.map((v) => v.experience))

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
                <Link href="/vendors" className="hover:text-foreground">Vendors</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground">Compare</span>
              </div>
              <h1 className="mt-4 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Compare Vendors
              </h1>
              <p className="mt-2 text-muted-foreground">
                Side-by-side comparison of {selected.length} vendors
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="px-4 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl overflow-x-auto">
            <FadeIn>
              <table className="w-full min-w-[600px] border-separate border-spacing-0 rounded-xl border border-border/60 bg-card overflow-hidden">
                {/* Header row with vendor names */}
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 w-36 border-b border-r border-border/40 bg-secondary/50 px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Attribute
                    </th>
                    {selected.map((v) => (
                      <th key={v.id} className="border-b border-border/40 px-4 py-4 text-center">
                        <Link href={`/vendors/${v.slug}`} className="group">
                          <p className="font-serif text-base font-semibold text-card-foreground group-hover:text-primary transition-colors">
                            {v.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {v.category}
                          </p>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? "bg-card" : "bg-secondary/20"}>
                      <td className="sticky left-0 z-10 border-r border-border/40 px-4 py-3 text-sm font-medium text-muted-foreground" style={{ background: i % 2 === 0 ? "var(--card)" : "oklch(0.97 0.005 30 / 0.2)" }}>
                        {row.label}
                      </td>
                      {selected.map((v) => (
                        <td key={v.id} className="px-4 py-3 text-center">
                          {row.render(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Action row */}
                  <tr className="bg-secondary/30">
                    <td className="sticky left-0 z-10 border-r border-t border-border/40 px-4 py-4 bg-secondary/30" />
                    {selected.map((v) => (
                      <td key={v.id} className="border-t border-border/40 px-4 py-4 text-center">
                        <Link href={`/vendors/${v.slug}`}>
                          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                            View Profile
                          </Button>
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div>Loading comparison...</div>}>
      <ComparePageContent />
    </Suspense>
  )
}
