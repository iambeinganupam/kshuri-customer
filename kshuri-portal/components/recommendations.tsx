"use client"

import Link from "next/link"
import { Lightbulb, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/star-rating"
import { useVendorList } from "@/lib/content/vendors"
import { cn } from "@/lib/utils"

// Complementary category map
const complementaryCategories: Record<string, string[]> = {
  "mehndi-artist": ["makeup-artist", "photography-video"],
  "tent-decoration": ["catering-halwai", "event-managers"],
  "catering-halwai": ["tent-decoration", "wedding-venues"],
  "makeup-artist": ["mehndi-artist", "photography-video"],
  "photography-video": ["makeup-artist", "tent-decoration"],
  "wedding-venues": ["tent-decoration", "catering-halwai"],
  "event-managers": ["tent-decoration", "photography-video"],
}

interface Props {
  currentVendorId: string
  currentCategorySlug: string
  city?: string
  className?: string
}

export function Recommendations({ currentVendorId, currentCategorySlug, city, className }: Props) {
  const companionSlugs = complementaryCategories[currentCategorySlug] || []
  const { vendors, isLoading } = useVendorList({ limit: 50 })

  if (companionSlugs.length === 0) return null
  if (isLoading) return null

  const recommendations = companionSlugs.flatMap((slug) =>
    vendors
      .filter(
        (v) =>
          v.categorySlug === slug &&
          v.id !== currentVendorId &&
          (city ? v.city === city : true) &&
          v.rating >= 4.5
      )
      .slice(0, 2)
  )

  if (recommendations.length === 0) return null

  return (
    <div className={cn("rounded-xl border border-border/60 bg-card p-5", className)}>
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-card-foreground">
        <Lightbulb className="h-4 w-4 text-gold" />
        You Might Also Need
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {recommendations.map((v) => (
          <Link key={v.id} href={`/vendors/${v.slug}`}>
            <motion.div
              className="flex flex-col gap-1.5 rounded-lg border border-border/50 bg-background p-3 transition-colors hover:border-primary/30"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">{v.category}</Badge>
                <StarRating rating={v.rating} size="xs" />
              </div>
              <p className="text-sm font-semibold text-foreground line-clamp-1">
                {v.name}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {v.area}, {v.city}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
