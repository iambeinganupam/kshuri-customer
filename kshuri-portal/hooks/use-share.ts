"use client"

import { useCallback } from "react"
import { toast } from "sonner"

interface ShareData {
  vendorName: string
  category: string
  city: string
  rating: number
  slug: string
}

export function useShare() {
  const share = useCallback(async (data: ShareData) => {
    const url = `${window.location.origin}/vendors/${data.slug}`
    const text = `Check out ${data.vendorName} on Kshuri — ${data.category} in ${data.city}, rated ${data.rating}⭐\n\n${url}`

    // Try native Web Share API (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.vendorName} — Kshuri`,
          text: text,
          url: url,
        })
        return
      } catch (e) {
        // User cancelled or API error — fall through to copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Link Copied!", {
        description: "Share it with your family on WhatsApp or anywhere else.",
      })
    } catch {
      toast.error("Could not copy link. Please copy the URL manually.")
    }
  }, [])

  const shareWhatsApp = useCallback((data: ShareData) => {
    const url = `${window.location.origin}/vendors/${data.slug}`
    const text = `Check out *${data.vendorName}* on Kshuri — ${data.category} in ${data.city}, rated ${data.rating}⭐\n\n${url}`
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(waUrl, "_blank")
  }, [])

  return { share, shareWhatsApp }
}
