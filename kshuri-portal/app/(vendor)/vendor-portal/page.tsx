"use client"

import Link from "next/link"
import {
  ArrowRight,
  Star,
  IndianRupee,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  CheckCircle2,
  BarChart3,
  MessageSquare,
  CalendarCheck,
  ChevronRight,
} from "lucide-react"
import { motion } from "framer-motion"
import { VendorNavbar } from "@/components/vendor-navbar"
import { VendorFooter } from "@/components/vendor-footer"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper"

const stats = [
  { value: "10,000+", label: "Active Vendors", icon: Users },
  { value: "50,000+", label: "Bookings completed",   icon: Star },
  { value: "500+",    label: "Cities Covered",     icon: Globe },
  { value: "₹0",     label: "Listing Fee",         icon: IndianRupee },
]

const benefits = [
  {
    icon: Globe,
    title: "Massive Reach",
    description:
      "Get discovered by customers booking grooming services every week across India.",
  },
  {
    icon: Shield,
    title: "Verified Badge",
    description:
      "Earn a trusted vendor badge that signals credibility and quality to prospective customers.",
  },
  {
    icon: BarChart3,
    title: "Smart Dashboard",
    description:
      "Track profile views, inquiries, bookings, and revenue — all in one clean interface.",
  },
  {
    icon: Zap,
    title: "Instant Inquiries",
    description:
      "Receive real-time leads from customers in your city and respond directly on the platform.",
  },
  {
    icon: IndianRupee,
    title: "Zero Setup Cost",
    description:
      "List your services completely free. We only earn when you do — no hidden charges.",
  },
  {
    icon: TrendingUp,
    title: "Performance Insights",
    description:
      "Understand what's working. Optimise your profile using data-driven recommendations.",
  },
]

const steps = [
  {
    num: "01",
    title: "Create Your Profile",
    description:
      "Sign up, describe your services, add your portfolio photos, set your pricing, and go live in minutes.",
  },
  {
    num: "02",
    title: "Receive Leads",
    description:
      "Customers find you through search, categories, and curated recommendations. You get notified instantly.",
  },
  {
    num: "03",
    title: "Grow Your Business",
    description:
      "Respond to inquiries, confirm bookings, collect reviews, and watch your calendar fill up.",
  },
]

const categories = [
  "Hair", "Makeup", "Skin & Facial", "Spa & Massage",
  "Nails", "Barber & Men's Grooming", "Hair Removal", "Threading & Brows",
]

export default function VendorPortalPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0f0808]">
      <VendorNavbar />

      <main className="flex-1">

        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden px-4 py-24 lg:py-32">
          {/* Dot grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Glow blobs */}
          <motion.div
            className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-gold/10 blur-[80px]"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          <div className="relative mx-auto max-w-4xl text-center">
            <FadeIn>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
                Kshuri Partners Program
              </span>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
                Grow your grooming business{" "}
                <span className="bg-gradient-to-r from-primary via-red-400 to-gold bg-clip-text text-transparent">
                  with Kshuri
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
                Join 10,000+ grooming professionals on India&apos;s most trusted booking platform. Reach customers actively booking services — for free.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/vendor-portal/dashboard"
                  className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-gold-foreground shadow-lg shadow-gold/20 transition-all hover:bg-gold/90 hover:scale-[1.02]"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-md border border-white/25 px-6 py-2.5 text-sm font-medium text-white/80 transition-all hover:bg-white/8 hover:text-white"
                >
                  How It Works
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="border-y border-white/10 bg-white/[0.02] px-4 py-10">
          <div className="mx-auto max-w-5xl">
            <StaggerContainer
              staggerDelay={0.1}
              className="grid grid-cols-2 gap-6 sm:grid-cols-4"
            >
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      <stat.icon className="h-4 w-4 text-gold/80" />
                    </div>
                    <p className="font-serif text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/40">{stat.label}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ===== BENEFITS ===== */}
        <section className="px-4 py-20 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <FadeIn className="mb-14 text-center">
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                Everything You Need to Succeed
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/45">
                Built specifically for grooming professionals — not a generic business listing
              </p>
            </FadeIn>

            <StaggerContainer
              staggerDelay={0.07}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {benefits.map((b) => (
                <StaggerItem key={b.title}>
                  <motion.div
                    className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-white/20 hover:bg-white/[0.06]"
                    whileHover={{ y: -3 }}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
                      <b.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{b.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/45">{b.description}</p>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section id="how-it-works" className="border-y border-white/10 bg-white/[0.02] px-4 py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <FadeIn className="mb-14 text-center">
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                How It Works
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/45">
                From signup to your first booking — in three simple steps
              </p>
            </FadeIn>

            <StaggerContainer
              staggerDelay={0.15}
              className="grid grid-cols-1 gap-10 md:grid-cols-3"
            >
              {steps.map((step, i) => (
                <StaggerItem key={step.num}>
                  <div className="relative flex flex-col items-center text-center">
                    {i < steps.length - 1 && (
                      <div className="absolute top-8 left-[calc(50%+2.5rem)] hidden h-px w-[calc(100%-5rem)] bg-gradient-to-r from-primary/40 to-transparent md:block" />
                    )}
                    <motion.div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      whileHover={{ scale: 1.1, rotate: 2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <span className="font-serif text-xl font-bold">{step.num}</span>
                    </motion.div>
                    <h3 className="mt-5 font-serif text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/45">{step.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ===== WHO CAN JOIN ===== */}
        <section className="px-4 py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <FadeIn className="mb-10 text-center">
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                Who Can Join?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/45">
                We welcome all grooming professionals across India
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/60"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-gold/70" />
                    {cat}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="relative overflow-hidden bg-primary px-4 py-16 lg:py-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <FadeIn direction="none" className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
              Ready to Grow Your Business?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-primary-foreground/70 sm:text-base">
              Join India&apos;s fastest-growing grooming marketplace today. Setup takes less than 10 minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/vendor-portal/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-lg transition-all hover:bg-white/90 hover:scale-[1.02]"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-md border border-white/60 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
              >
                Talk to the Team
              </Link>
            </div>
          </FadeIn>
        </section>

      </main>

      <VendorFooter />
    </div>
  )
}
