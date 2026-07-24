"use client"

import Link from "next/link"
import { Clock, Star, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"
import { cn } from "@/lib/utils"

export function RecentlyViewed({ className }: { className?: string }) {
  const { items } = useRecentlyViewed()

  if (items.length === 0) return null

  return (
    <div className={cn("rounded-xl border border-border/60 bg-card p-4", className)}>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Clock className="h-4 w-4" />
        Recently Viewed
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((item, i) => (
          <Link key={item.id} href={`/vendors/${item.slug}`}>
            <motion.div
              className="flex w-40 shrink-0 flex-col gap-1.5 rounded-lg border border-border/50 bg-background p-3 transition-colors hover:border-primary/30"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ y: -2 }}
            >
              <p className="text-sm font-semibold text-foreground line-clamp-1">
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {item.category}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-gold text-gold" />
                  {item.rating}
                </span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {item.city}
                </span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
