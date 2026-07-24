"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Heart, CalendarCheck } from "lucide-react"
import { motion } from "framer-motion"
import { useWishlist } from "@/hooks/use-wishlist"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "Home",    href: "/",         icon: Home },
  { label: "Explore", href: "/vendors",   icon: Search },
  { label: "Saved",   href: "/wishlist",  icon: Heart },
  { label: "Planner", href: "/checklist", icon: CalendarCheck },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { count } = useWishlist()

  // Hide on vendor portal pages
  if (pathname.startsWith("/vendor-portal")) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Frosted glass bar */}
      <div className="border-t border-border/50 bg-background/90 backdrop-blur-xl px-2 pb-safe">
        <div className="flex items-stretch justify-around">
          {tabs.map((tab) => {
            const active = tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href)
            const Icon = tab.icon
            const isWishlist = tab.href === "/wishlist"

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-1 flex-col items-center justify-center gap-1 py-3 min-h-[60px]"
              >
                {active && (
                  <motion.div
                    layoutId="mobile-tab-indicator"
                    className="absolute inset-x-2 -top-px h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <div className="relative">
                  <motion.div
                    animate={active ? { scale: 1.12 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        active ? "text-primary" : "text-muted-foreground"
                      )}
                      strokeWidth={active ? 2.5 : 1.75}
                    />
                  </motion.div>
                  {isWishlist && count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white"
                    >
                      {count > 9 ? "9+" : count}
                    </motion.span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
