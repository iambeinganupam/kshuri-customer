"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  VENDOR_MODE_ALL_META,
  VENDOR_MODE_META,
  type VendorModeFilter,
  type VendorModeMeta,
} from "@/lib/vendor-mode"

interface ServiceModeFilterProps {
  value: VendorModeFilter
  onChange: (next: VendorModeFilter) => void
  /** Optional counts shown alongside each segment (e.g. "Home Service · 12"). */
  counts?: {
    all?: number
    home?: number
    salon?: number
  }
  className?: string
}

interface Segment {
  value: VendorModeFilter
  meta: VendorModeMeta
  countKey: keyof NonNullable<ServiceModeFilterProps["counts"]>
}

const SEGMENTS: Segment[] = [
  { value: "all", meta: VENDOR_MODE_ALL_META, countKey: "all" },
  { value: "home", meta: VENDOR_MODE_META.home, countKey: "home" },
  { value: "salon", meta: VENDOR_MODE_META.salon, countKey: "salon" },
]

/** Segmented control for filtering the vendor list by service mode.
 *
 *  Swiggy Dineout-style "Order Online | Dineout" tabs — three pills with the
 *  selected one filled solid and the others soft. Each segment carries its
 *  meta-defined icon + accent. */
export function ServiceModeFilter({
  value,
  onChange,
  counts,
  className,
}: ServiceModeFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter by service mode"
      className={cn(
        "inline-flex w-full flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card p-1.5 sm:w-auto",
        className,
      )}
    >
      {SEGMENTS.map((seg) => {
        const active = value === seg.value
        const Icon = seg.meta.icon
        const count = counts?.[seg.countKey]
        return (
          <motion.button
            key={seg.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(seg.value)}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
              active
                ? cn(seg.meta.accentSolid, "shadow-sm")
                : "bg-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", active ? "" : "opacity-70")} />
            <span>{seg.meta.label}</span>
            {typeof count === "number" && (
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1.5 text-[10px] font-bold leading-none py-0.5",
                  active
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

/** Inline helper strip — surfaced beneath the filter to explain what the
 *  selected mode means. Hidden when "all" is selected. */
export function ServiceModeFilterHelper({
  value,
  className,
}: {
  value: VendorModeFilter
  className?: string
}) {
  if (value === "all") return null
  const meta = VENDOR_MODE_META[value]
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      <span className="font-semibold text-foreground">{meta.label}</span>
      {" — "}
      {meta.helper}
    </p>
  )
}
