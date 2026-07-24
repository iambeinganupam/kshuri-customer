"use client"

import Link from "next/link"
import { BadgeCheck, MapPin, Briefcase, Heart, Star } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { ServiceModeBadge } from "@/components/service-mode-badge"
import { useWishlist } from "@/hooks/use-wishlist"
import { useCompare } from "@/hooks/use-compare"
import { vendorTypeToMode } from "@/lib/vendor-mode"
import type { Vendor } from "@/lib/data"
import { cn } from "@/lib/utils"

const gradients = [
  "from-primary/80 to-primary/40",
  "from-gold/70 to-primary/30",
  "from-primary/60 to-gold/50",
  "from-primary/70 to-secondary",
  "from-gold/60 to-primary/50",
  "from-primary/50 to-gold/40",
]

function getGradient(id: string): string {
  const idx = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradients.length
  return gradients[idx]
}

function formatPrice(min: number): string {
  if (min >= 100000) return `₹${(min / 100000).toFixed(1)}L`
  if (min >= 1000) return `₹${(min / 1000).toFixed(0)}K`
  return `₹${min}`
}

interface VendorCardProps {
  vendor: Vendor
  className?: string
  showCompare?: boolean
}

export function VendorCard({ vendor, className, showCompare = true }: VendorCardProps) {
  const { toggle: toggleWishlist, has: isWishlisted } = useWishlist()
  const { toggle: toggleCompare, has: isCompared, isFull } = useCompare()
  const wishlisted = isWishlisted(vendor.id)
  const compared = isCompared(vendor.id)
  // Discovery data can carry vendors with no business_name yet; never let an
  // empty name crash the card (initials / heading / alt all read from this).
  const displayName = vendor.name?.trim() || "New vendor"

  return (
    <motion.div
      className={cn("h-full", className)}
      whileHover={{ y: -3, transition: { type: "spring", stiffness: 320, damping: 22 } }}
    >
      {/* 
        Mobile: horizontal card (image left, content right) 
        Desktop: vertical card (image top, content below)
      */}
      <Link href={vendor.slug ? `/vendors/${vendor.slug}` : '/vendors'} className="block h-full">
        <div className={cn(
          "group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300",
          "hover:border-primary/40 hover:shadow-[0_8px_32px_-4px_oklch(0.38_0.15_18_/_0.18)]",
          // Mobile: horizontal flex row | Desktop: vertical column
          "flex flex-row md:flex-col"
        )}>

          {/* Cover area — real photo when present, branded gradient otherwise. */}
          <div className={cn(
            "relative flex-shrink-0 overflow-hidden",
            // Mobile: square thumbnail on left | Desktop: full-width top image
            "w-[118px] h-[118px] md:w-full md:h-48",
            !vendor.coverImageUrl && "bg-gradient-to-br",
            !vendor.coverImageUrl && getGradient(vendor.id),
          )}>
            {vendor.coverImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={vendor.coverImageUrl}
                alt={`${displayName} cover`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif text-2xl md:text-4xl font-bold text-white/25 select-none">
                  {displayName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
              </div>
            )}

            {/* Bottom gradient — keeps badges legible on busy photos. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Shimmer on hover (only when image is real — feels weird on gradient). */}
            {vendor.coverImageUrl && (
              <motion.div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full"
                whileHover={{ translateX: "300%" }}
                transition={{ duration: 0.65, ease: "easeInOut" }}
              />
            )}

            {/* Featured badge (desktop only, top right) */}
            {vendor.featured && (
              <Badge className="absolute top-2 right-2 bg-gold text-gold-foreground text-[10px] px-2 py-0.5 hidden md:flex">
                Featured
              </Badge>
            )}

            {/* Vendor-kind pill (Freelancer / Salon) — neutral terminology so
                we don't claim a service mode we don't have data for. */}
            <ServiceModeBadge
              mode={vendorTypeToMode(vendor.vendorType)}
              variant="solid"
              size="sm"
              className="absolute right-2 top-2 md:right-2 md:top-auto md:bottom-2"
            />

            {/* Verified badge (mobile only — desktop renders one in the content area) */}
            {vendor.verified && (
              <div className="absolute bottom-2 left-2 md:hidden flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5">
                <BadgeCheck className="h-2.5 w-2.5 text-white" />
                <span className="text-[9px] font-bold text-white">Verified</span>
              </div>
            )}

            {/* Wishlist heart */}
            <motion.button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleWishlist(vendor.id)
              }}
              className={cn(
                "absolute top-2 left-2 md:top-3 md:left-3 z-10 flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full transition-all",
                wishlisted
                  ? "bg-white/95 text-red-500 shadow-md"
                  : "bg-black/40 text-white backdrop-blur-sm hover:bg-black/55"
              )}
              whileTap={{ scale: 0.8 }}
              aria-label={wishlisted ? "Remove from wishlist" : "Save"}
            >
              <Heart className={cn("h-3.5 w-3.5", wishlisted && "fill-red-500")} />
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col justify-between p-3 md:p-4 min-w-0">

            {/* Mobile: top row with featured dot + category */}
            <div className="md:hidden flex items-center gap-1.5 mb-1">
              {vendor.featured && (
                <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
              )}
              <span className="text-[10px] font-medium text-muted-foreground truncate">{vendor.category}</span>
            </div>

            {/* Desktop: category badges row */}
            <div className="hidden md:flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">{vendor.category}</Badge>
              {vendor.verified && (
                <Badge className="bg-primary text-primary-foreground gap-1 text-xs">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </Badge>
              )}
            </div>

            {/* Name */}
            <h3 className="font-serif font-semibold leading-tight text-card-foreground line-clamp-1 text-base md:text-lg">
              {displayName}
            </h3>

            {/* Rating row */}
            <div className="flex items-center gap-1 mt-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.round(vendor.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-foreground">{vendor.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({vendor.reviewCount})</span>
            </div>

            {/* Location + experience — mobile compact */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1.5">
              <span className="flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                {vendor.city}
              </span>
              <span className="text-border/60">·</span>
              <span className="flex items-center gap-0.5">
                <Briefcase className="h-2.5 w-2.5 shrink-0" />
                {vendor.experience}+ yrs
              </span>
            </div>

            {/* Price */}
            <div className="mt-2 flex items-center justify-between gap-2">
              <div>
                <span className="text-sm font-bold text-foreground">{formatPrice(vendor.priceMin)}</span>
                <span className="text-xs text-muted-foreground"> onwards</span>
              </div>
              {/* Mobile: tiny arrow CTA */}
              <span className="flex-shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary md:hidden">
                View →
              </span>
            </div>

            {/* Desktop: View Profile button + Compare */}
            <div className="hidden md:flex items-center justify-between gap-2 pt-2 border-t border-border/40 mt-2">
              {showCompare && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleCompare(vendor.id)
                  }}
                  disabled={isFull && !compared}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors",
                    compared
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border/60 text-muted-foreground hover:border-primary/30",
                    isFull && !compared && "opacity-40 cursor-not-allowed"
                  )}
                >
                  Compare
                </button>
              )}
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="ml-auto"
              >
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  View Profile →
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}