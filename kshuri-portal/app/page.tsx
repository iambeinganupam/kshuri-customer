"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Users, MapPin, Heart, Search, ChevronRight, PiggyBank, CheckSquare, Camera, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
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
import { CategoryCard } from "@/components/category-card"
import { TestimonialCard } from "@/components/testimonial-card"
import { SearchBar } from "@/components/search-bar"
import { BackToTop } from "@/components/back-to-top"
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  GlowOrb,
  RevealText,
  PremiumCard,
} from "@/components/motion-wrapper"
import { useHomeFeatured, useHomeTrending, useHomeTestimonials, useHomeStats } from "@/lib/content/home"
import { useGroomingCategories } from "@/lib/content/categories"
import { EmptyState } from "@/components/empty-state"
import { SkeletonCard } from "@/components/skeleton-card"
import type { Vendor } from "@/lib/types/vendor"
import { WEDDING_FEATURES_ENABLED } from "@/lib/feature-flags"

const statsMeta = [
  { label: "Verified Vendors", icon: Users },
  { label: "Cities Covered", icon: MapPin },
  { label: "Happy customers", icon: Heart },
]

const steps = [
  {
    step: "01",
    title: "Browse & Compare",
    description:
      "Search vendors by service, city, budget, and ratings. Compare profiles, portfolios, and prices side by side.",
  },
  {
    step: "02",
    title: "Book on Kshuri",
    description:
      "Select your preferred package, pick a date and time, and book directly on our platform. No need to call or message vendors separately.",
  },
  {
    step: "03",
    title: "Celebrate Stress-Free",
    description:
      "We manage all vendor communication and coordination. Track your bookings, get updates, and arrive ready.",
  },
]

const heroVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const heroChild = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number] },
  },
}

export default function HomePage() {
  const featuredQ = useHomeFeatured(6)
  const trendingQ = useHomeTrending(6)
  const testimonialsQ = useHomeTestimonials(10)
  const categoriesQ = useGroomingCategories()
  const statsQ = useHomeStats()

  const featured = featuredQ.vendors
  const trending = trendingQ.vendors
  const testimonials = testimonialsQ.testimonials
  const categories = categoriesQ.categories

  const heroStats = statsQ.data
  const vendorCount = heroStats?.vendor_count ?? 0
  const cityCount = heroStats?.city_count ?? 0
  const bookingCount = heroStats?.completed_booking_count ?? 0
  const statsValues = [vendorCount, cityCount, bookingCount]

  // Stagger the boxShadow pulse on each stat icon. Computed once at mount
  // so the framer-motion `transition` prop is pure across re-renders.
  const [statDelays] = useState(() => statsMeta.map(() => Math.random() * 2))

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/80 px-4 py-20 lg:py-28">
          {/* Dot grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Animated glow orbs */}
          <GlowOrb className="-top-20 left-1/4 h-80 w-80 bg-white/10" delay={0} duration={8} />
          <GlowOrb className="bottom-0 right-1/4 h-64 w-64 bg-gold/15" delay={1.5} duration={6} />
          <GlowOrb className="top-1/2 left-10 h-48 w-48 bg-white/5" delay={3} duration={9} />

          <div className="relative mx-auto max-w-7xl">
            <motion.div
              className="mx-auto max-w-3xl text-center"
              variants={heroVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1
                variants={heroChild}
                className="font-serif text-4xl font-bold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl text-balance"
              >
                Daily grooming, on demand.
              </motion.h1>
              <motion.p
                variants={heroChild}
                className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg"
              >
                Book trusted hair, makeup, spa, nails, barber, and skincare professionals — everything in one place.
              </motion.p>

              {/* Search Bar */}
              <motion.div variants={heroChild} className="mt-8">
                <SearchBar />
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={heroChild}
                className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
              >
                {statsMeta.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10"
                      animate={{ boxShadow: ["0 0 0 0 rgba(255,255,255,0.2)", "0 0 0 8px rgba(255,255,255,0)", "0 0 0 0 rgba(255,255,255,0)"] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: statDelays[i] }}
                    >
                      <stat.icon className="h-5 w-5 text-primary-foreground" />
                    </motion.div>
                    <div className="text-left">
                      <p className="text-lg font-bold text-primary-foreground">
                        {statsQ.isLoading
                          ? "—"
                          : <AnimatedCounter target={statsValues[i]} suffix="+" />
                        }
                      </p>
                      <p className="text-xs text-primary-foreground/60">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ===== PLANNING TOOLS ===== */}
        {WEDDING_FEATURES_ENABLED && (
        <section className="relative -mt-8 z-10 px-4 pb-8">
          <div className="mx-auto max-w-5xl">
            <StaggerContainer
              staggerDelay={0.08}
              className="grid grid-cols-3 gap-3 max-w-2xl mx-auto"
            >
              {[
                { Icon: PiggyBank,   label: "Budget Planner",  desc: "Track your wedding budget",     href: "/planner" },
                { Icon: CheckSquare, label: "Checklist",        desc: "Plan step by step",             href: "/checklist" },
                { Icon: Camera,      label: "Wedding Stories",  desc: "Get inspired by real weddings", href: "/stories" },
              ].map((tool) => (
                <StaggerItem key={tool.href}>
                  <PremiumCard className="h-full">
                    <Link href={tool.href}>
                      <motion.div
                        className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-4 py-5 text-center shadow-sm transition-all hover:shadow-[0_6px_24px_-4px_oklch(0.38_0.15_18_/_0.18)] hover:border-primary/40 hover:bg-primary/[0.03]"
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 14 }}
                        >
                          <tool.Icon className="h-5 w-5" />
                        </motion.div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{tool.label}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground leading-tight">{tool.desc}</p>
                        </div>
                      </motion.div>
                    </Link>
                  </PremiumCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
        )}

        {/* ===== SERVICE CATEGORIES ===== */}
        <section className="px-4 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <FadeIn className="mb-10 flex flex-col gap-2 text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
                Browse by service
              </h2>
              <p className="mx-auto max-w-xl text-muted-foreground">
                Hair, makeup, spa, nails, barber, skincare — everything in one place
              </p>
            </FadeIn>

            {categoriesQ.isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <SkeletonCard count={8} />
              </div>
            ) : categories.length === 0 ? (
              <EmptyState
                title="No categories yet"
                description="Service categories are being set up. Check back shortly."
              />
            ) : (
              <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map((cat) => (
                  <StaggerItem key={cat.id}>
                    <CategoryCard category={cat} variant="large" />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}

            <FadeIn delay={0.3} className="mt-8 text-center">
              <Link href="/services">
                <Button
                  variant="outline"
                  className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
                >
                  View All Services
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </FadeIn>
          </div>
        </section>

        {/* ===== FEATURED VENDORS ===== */}
        <section className="bg-secondary/50 px-4 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <FadeIn className="mb-10 flex items-end justify-between">
              <div className="flex flex-col gap-2">
                <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                  Featured Vendors
                </h2>
                <p className="text-muted-foreground">
                  Top-rated professionals trusted by thousands of families
                </p>
              </div>
              <Link
                href="/vendors"
                className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </FadeIn>

            {featuredQ.isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SkeletonCard count={3} />
              </div>
            ) : featured.length === 0 ? (
              <EmptyState
                title="No featured vendors yet"
                description="Check back soon — we're onboarding more professionals."
                ctaLabel="Browse all vendors"
                ctaHref="/vendors"
              />
            ) : (
              <>
                <FadeIn delay={0.15}>
                  <Carousel
                    opts={{ align: "start", loop: true }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-4">
                      {featured.map((vendor) => (
                        <CarouselItem
                          key={vendor.id}
                          className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                        >
                          <VendorCard vendor={vendor} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex -left-4" />
                    <CarouselNext className="hidden sm:flex -right-4" />
                  </Carousel>
                </FadeIn>

                <div className="mt-6 text-center sm:hidden">
                  <Link href="/vendors">
                    <Button variant="outline" size="sm" className="gap-1">
                      View All Vendors <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="px-4 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <FadeIn className="mb-12 text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
                How Kshuri Works
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Booking your next appointment has never been this simple
              </p>
            </FadeIn>

            <StaggerContainer staggerDelay={0.2} className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <StaggerItem key={step.step}>
                  <div className="relative flex flex-col items-center text-center">
                    {/* Connector line (desktop) */}
                    {i < steps.length - 1 && (
                      <div className="absolute top-8 left-[calc(50%+2rem)] hidden h-0.5 w-[calc(100%-4rem)] bg-gradient-to-r from-primary/30 to-primary/10 md:block" />
                    )}
                    <motion.div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
                      whileHover={{ scale: 1.1, rotate: 3 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <span className="font-serif text-xl font-bold">
                        {step.step}
                      </span>
                    </motion.div>
                    <h3 className="mt-5 font-serif text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="bg-secondary/50 px-4 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <FadeIn className="mb-10 text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
                Loved by customers across India
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Real stories from real customers who found their trusted professionals on Kshuri
              </p>
            </FadeIn>

            {testimonialsQ.isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SkeletonCard count={3} />
              </div>
            ) : testimonials.length === 0 ? (
              <EmptyState
                title="We're collecting stories"
                description="Real customer testimonials will appear here as bookings complete."
              />
            ) : (
              <FadeIn delay={0.15}>
                <Carousel
                  opts={{ align: "start", loop: true }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4">
                    {testimonials.map((t) => (
                      <CarouselItem
                        key={t.id}
                        className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                      >
                        <TestimonialCard testimonial={t} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex -left-4" />
                  <CarouselNext className="hidden sm:flex -right-4" />
                </Carousel>
              </FadeIn>
            )}
          </div>
        </section>

        {/* ===== TRENDING VENDORS ===== */}
        <section className="px-4 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <FadeIn className="mb-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl flex items-center gap-3">
                    <TrendingUp className="h-7 w-7 text-primary" />
                    Trending This Week
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Most popular vendors based on bookings and ratings
                  </p>
                </div>
                <Link href="/vendors">
                  <Button variant="outline" size="sm" className="gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </FadeIn>

            {trendingQ.isLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <SkeletonCard count={3} />
              </div>
            ) : trending.length === 0 ? (
              <EmptyState
                title="Nothing trending right now"
                ctaLabel="Browse all vendors"
                ctaHref="/vendors"
              />
            ) : (
              <StaggerContainer
                staggerDelay={0.06}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {trending.map((vendor) => (
                  <StaggerItem key={vendor.id}>
                    <VendorCard vendor={vendor} showCompare={false} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </section>

        {/* ===== CTA BANNER ===== */}
        <section className="relative overflow-hidden bg-primary px-4 py-16 lg:py-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <FadeIn direction="none" className="relative mx-auto max-w-3xl text-center">
            <motion.h2
              className="font-serif text-3xl font-bold text-primary-foreground sm:text-4xl text-balance"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Are you a grooming professional?
            </motion.h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/80">
              Join thousands of vendors on Kshuri and reach customers booking weekly haircuts, makeup, spa, and more. List your services for free.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/vendor-portal"
                className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-lg transition-all hover:bg-white/90 hover:scale-[1.02]"
              >
                Partner Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-md border border-white/60 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
              >
                Learn More
              </Link>
            </div>
          </FadeIn>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
