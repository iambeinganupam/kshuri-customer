"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CategoryCard } from "@/components/category-card"
import { BackToTop } from "@/components/back-to-top"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper"
import { useGroomingCategories } from "@/lib/content/categories"
import { EmptyState } from "@/components/empty-state"
import { SkeletonCard } from "@/components/skeleton-card"

export default function ServicesPage() {
  const { categories, isLoading } = useGroomingCategories()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-br from-primary/5 to-gold/5 px-4 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <FadeIn>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground">Services</span>
              </div>
              <h1 className="mt-4 font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
                Browse by service
              </h1>
              <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
                Hair, makeup, spa, nails, barber, skincare — browse the categories and find the best professionals in your city.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="px-4 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <SkeletonCard count={8} />
              </div>
            ) : categories.length === 0 ? (
              <EmptyState
                title="No service categories yet"
                description="The service taxonomy is being set up. Check back shortly."
              />
            ) : (
              <StaggerContainer
                staggerDelay={0.08}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {categories.map((cat) => (
                  <StaggerItem key={cat.id}>
                    <CategoryCard
                      category={cat}
                      variant="large"
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
