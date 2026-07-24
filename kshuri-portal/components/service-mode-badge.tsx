"use client"

import { cn } from "@/lib/utils"
import {
  VENDOR_MODE_META,
  type VendorMode,
} from "@/lib/vendor-mode"

interface ServiceModeBadgeProps {
  mode: VendorMode | null | undefined
  /** "soft" (chip on a card) or "solid" (filled pill on a hero). Default soft. */
  variant?: "soft" | "solid"
  /** Compact form drops the long label and shows just the icon + short label. */
  size?: "sm" | "md"
  className?: string
}

/** A pill chip showing the service mode (Home Service / At Salon).
 *
 *  Renders nothing when `mode` is null — keeps the legacy listings rendering
 *  cleanly while we backfill `vendor_type` everywhere. */
export function ServiceModeBadge({
  mode,
  variant = "soft",
  size = "sm",
  className,
}: ServiceModeBadgeProps) {
  if (!mode) return null
  const meta = VENDOR_MODE_META[mode]
  const Icon = meta.icon
  const isCompact = size === "sm"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold whitespace-nowrap",
        isCompact ? "h-5 px-2 text-[10px]" : "h-7 px-2.5 text-xs",
        variant === "soft" ? meta.accentSoft : meta.accentSolid,
        className,
      )}
      title={meta.helper}
      aria-label={`${meta.label} — ${meta.helper}`}
    >
      <Icon className={cn(isCompact ? "h-2.5 w-2.5" : "h-3.5 w-3.5")} />
      {isCompact ? meta.shortLabel : meta.label}
    </span>
  )
}
