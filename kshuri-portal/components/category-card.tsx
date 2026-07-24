"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Palette,
  Tent,
  UtensilsCrossed,
  Sparkles,
  Camera,
  Building2,
  ClipboardList,
  Scissors,
  Flower2,
  Gem,
  Wand2,
  Brush,
  Tag,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Category } from "@/lib/data"
import { cn } from "@/lib/utils"

// Two casing styles coexist:
//   • PascalCase keys — legacy `category.icon` values that older static seeds
//     wrote, kept for backward compatibility.
//   • lowercase keys — the new convention used by the DB `service_categories.icon`
//     column (mirrors @kshuri/ui's resolveCategoryIcon map).
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // PascalCase (legacy)
  Palette, Tent, UtensilsCrossed, Sparkles, Camera, Building2, ClipboardList,
  // lowercase (DB-backed, post-migration 073)
  scissors: Scissors,
  sparkles: Sparkles,
  flower: Flower2,
  gem: Gem,
  palette: Palette,
  wand: Wand2,
  brush: Brush,
  tag: Tag,
}

interface CategoryCardProps {
  category: Category
  variant?: "default" | "large"
  className?: string
}

export function CategoryCard({
  category,
  variant = "default",
  className,
}: CategoryCardProps) {
  const Icon = iconMap[category.icon] || Palette

  if (variant === "large") {
    return (
      <Link href={`/services/${category.slug}`}>
        <motion.div
          whileHover={{ y: -6, transition: { type: "spring", stiffness: 320, damping: 22 } }}
          className="h-full"
        >
          <Card
            className={cn(
              "group relative overflow-hidden border border-border/60 bg-gradient-to-br from-primary/8 to-gold/5 transition-all duration-300",
              "hover:border-primary/50 hover:shadow-[0_8px_32px_-4px_oklch(0.38_0.15_18_/_0.18)]",
              className
            )}
          >
            {/* Shimmer overlay on hover */}
            <motion.div
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/6 to-transparent -translate-x-full"
              whileHover={{ translateX: "300%" }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            />
            <CardContent className="flex flex-col gap-4 p-6">
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
                whileHover={{ scale: 1.15, rotate: 6 }}
                transition={{ type: "spring", stiffness: 450, damping: 14 }}
              >
                <Icon className="h-7 w-7" />
              </motion.div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-serif text-xl font-semibold text-card-foreground transition-colors group-hover:text-primary">
                  {category.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
              </div>
              <motion.span
                className="flex w-fit items-center gap-1 rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground"
                whileHover={{ scale: 1.05 }}
              >
                {category.vendorCount}+ Vendors
              </motion.span>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    )
  }

  return (
    <Link href={`/services/${category.slug}`}>
      <motion.div
        whileHover={{ y: -3, transition: { type: "spring", stiffness: 320, damping: 22 } }}
      >
        <Card
          className={cn(
            "group overflow-hidden border border-border/60 bg-card transition-all duration-300",
            "hover:border-primary/50 hover:shadow-[0_4px_20px_-4px_oklch(0.38_0.15_18_/_0.15)]",
            className
          )}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <motion.div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
              whileHover={{ scale: 1.12, rotate: 4 }}
              transition={{ type: "spring", stiffness: 450, damping: 14 }}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
            <div className="flex flex-col gap-0.5">
              <h3 className="font-serif text-base font-semibold text-card-foreground transition-colors group-hover:text-primary">
                {category.name}
              </h3>
              <span className="text-xs text-muted-foreground">
                {category.vendorCount}+ Vendors
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}
