"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import {
  Menu, Heart, Calculator, ListChecks, BookHeart, ChevronDown,
  GitCompareArrows, Home, Compass, Users, Phone, X, ArrowRight, Sparkles
} from "lucide-react"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useWishlist } from "@/hooks/use-wishlist"
import { cn } from "@/lib/utils"
import { WEDDING_FEATURES_ENABLED } from "@/lib/feature-flags"
import { UserMenu } from "@/components/user-menu"
import { CityPicker } from "@/components/discovery/CityPicker"
import { useGeo } from "@/lib/geo/use-geo"

// Top-10 markets — slugs MUST match lib/geo/cities.ts CITY_TO_SLUG canonical
// values so cookie city slugs round-trip through the picker without drift.
const POPULAR_CITIES = [
  { slug: "mumbai",    name: "Mumbai" },
  { slug: "delhi",     name: "Delhi" },
  { slug: "bengaluru", name: "Bengaluru" },
  { slug: "hyderabad", name: "Hyderabad" },
  { slug: "chennai",   name: "Chennai" },
  { slug: "kolkata",   name: "Kolkata" },
  { slug: "pune",      name: "Pune" },
  { slug: "ahmedabad", name: "Ahmedabad" },
  { slug: "jaipur",    name: "Jaipur" },
  { slug: "lucknow",   name: "Lucknow" },
] as const

const navLinks = [
  { label: "Home",     href: "/",        icon: Home },
  { label: "Services", href: "/services", icon: Compass },
  { label: "Vendors",  href: "/vendors",  icon: Users },
  { label: "Contact",  href: "/contact",  icon: Phone },
]

const toolLinks = [
  { label: "Compare Vendors",   href: "/vendors",   icon: GitCompareArrows, desc: "Side-by-side comparison",   weddingOnly: false },
  { label: "Budget Planner",    href: "/planner",   icon: Calculator,       desc: "Plan your wedding budget",  weddingOnly: true  },
  { label: "Wedding Checklist", href: "/checklist", icon: ListChecks,       desc: "Track your planning tasks", weddingOnly: true  },
  { label: "Wedding Stories",   href: "/stories",   icon: BookHeart,        desc: "Real wedding inspiration",  weddingOnly: true  },
]

export function Navbar() {
  const visibleTools = toolLinks.filter((t) => WEDDING_FEATURES_ENABLED || !t.weddingOnly)
  const [open, setOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const { count } = useWishlist()
  const dropdownRef = useRef<HTMLDivElement>(null)
  // Geo cookie drives the CityPicker trigger label. Local override keeps the
  // label in sync immediately after a manual pick without waiting for a
  // re-mount (useGeo only reads on mount).
  const geo = useGeo()
  const [pickedCity, setPickedCity] = useState<string | null>(null)
  const cityValue = pickedCity ?? geo?.city ?? "mumbai"

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20)
  })

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        scrolled ? "border-border/50 shadow-sm" : "border-transparent"
      )}
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number] }}
    >
      <nav className={cn(
        "mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-8 transition-all duration-300",
        scrolled ? "h-14" : "h-16"
      )}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <span className="font-serif text-lg font-bold text-primary-foreground">K</span>
          </motion.div>
          <span className="font-serif text-xl font-bold text-foreground">Kshuri</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
          ))}

          {/* Planning Tools Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors",
                toolsOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Tools
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", toolsOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <div className="p-2">
                    {visibleTools.map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setToolsOpen(false)}>
                        <motion.div
                          className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/60"
                          whileHover={{ x: 2 }}
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <link.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-card-foreground">{link.label}</p>
                            <p className="text-xs text-muted-foreground">{link.desc}</p>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/contact"
            className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground group"
          >
            Contact
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <CityPicker
            value={{ city: cityValue, lat: geo?.lat, lng: geo?.lng }}
            popularCities={[...POPULAR_CITIES]}
            onChange={(v) => setPickedCity(v.city)}
          />

          <Link href="/wishlist" className="relative">
            <Button variant="ghost" size="icon" aria-label="Wishlist">
              <Heart className="h-4 w-4" />
              {count > 0 && (
                <motion.span
                  className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  key={count}
                >
                  {count}
                </motion.span>
              )}
            </Button>
          </Link>

          <Link href="/vendor-portal" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
            List your service
          </Link>

          <Link href="/vendors">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Explore Vendors
              </Button>
            </motion.div>
          </Link>

          {/* Auth-aware slot: avatar+menu when signed in, "Sign in" outline
              button when not. UserMenu owns its loading skeleton so the
              CTA cluster doesn't reflow when AuthProvider resolves. */}
          <UserMenu />
        </div>

        {/* Mobile — only hamburger (bottom nav handles tabs) */}
        <div className="flex items-center md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <motion.button
                className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary"
                whileTap={{ scale: 0.92 }}
                aria-label="Open menu"
              >
                <AnimatePresence mode="wait">
                  {open ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </SheetTrigger>

            {/* ── Premium Mobile Drawer ── */}
            <SheetContent side="right" className="w-[300px] p-0 flex flex-col gap-0">

              {/* Drawer Header with branding */}
              <SheetHeader className="px-5 pt-6 pb-5 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                    <span className="font-serif text-xl font-bold text-primary-foreground">K</span>
                  </div>
                  <div>
                    <SheetTitle className="font-serif text-lg leading-none">Kshuri</SheetTitle>
                    <p className="mt-1 text-xs text-muted-foreground">Daily grooming, on demand</p>
                  </div>
                </div>
              </SheetHeader>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">

                {/* Primary CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="mb-4"
                >
                  <Link href="/vendors" onClick={() => setOpen(false)}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-between rounded-xl bg-primary px-4 py-3.5 text-primary-foreground shadow-md shadow-primary/20"
                    >
                      <div>
                        <p className="text-sm font-semibold leading-none">Explore Vendors</p>
                        <p className="mt-1 text-xs text-primary-foreground/70">10,000+ verified professionals</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 opacity-80" />
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Navigate section */}
                <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Navigate</p>
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1, duration: 0.25, ease: "easeOut" }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary hover:text-primary active:scale-[0.98]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                        <link.icon className="h-4.5 w-4.5" />
                      </div>
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Planning tools section */}
                <div className="pt-4">
                  <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Tools</p>
                  <div className="grid grid-cols-2 gap-2">
                    {visibleTools.map((link, i) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, scale: 0.90 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (navLinks.length + i) * 0.05 + 0.15, duration: 0.25 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="flex flex-col gap-2.5 rounded-xl border border-border/50 bg-card p-3.5 transition-all hover:border-primary/30 hover:bg-primary/[0.03] active:scale-95"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <link.icon className="h-4 w-4" />
                          </div>
                          <p className="text-xs font-semibold text-foreground leading-snug">{link.label}</p>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer — vendor nudge */}
              <motion.div
                className="border-t border-border/50 px-4 py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  href="/vendor-portal"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-secondary/60 px-3.5 py-3 transition-colors hover:bg-secondary active:scale-[0.98]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/15 text-gold">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">List your service</p>
                    <p className="text-[10px] text-muted-foreground">Join 10,000+ vendors on Kshuri</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </Link>
              </motion.div>
            </SheetContent>
          </Sheet>
        </div>

      </nav>
    </motion.header>
  )
}
