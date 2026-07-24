"use client"

import Link from "next/link"
import { X, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useCompare } from "@/hooks/use-compare"
import { useVendorList } from "@/lib/content/vendors"

export function CompareBar() {
  const { ids, remove, clear } = useCompare()
  const { vendors: allVendors } = useVendorList({ limit: 50 })
  const selected = allVendors.filter((v) => ids.includes(v.id))

  if (selected.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur px-4 py-3 shadow-lg"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="shrink-0 text-sm font-medium text-muted-foreground">
              Compare ({selected.length}/3):
            </span>
            {selected.map((v) => (
              <motion.div
                key={v.id}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-foreground"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                {v.name}
                <button
                  onClick={() => remove(v.id)}
                  className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-destructive/10"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clear} className="text-xs">
              Clear
            </Button>
            {selected.length >= 2 && (
              <Link href={`/compare?ids=${ids.join(",")}`}>
                <Button size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
                  Compare <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
