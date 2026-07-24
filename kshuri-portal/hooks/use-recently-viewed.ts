"use client"

import { useCallback } from "react"
import type { Vendor } from "@/lib/data"
import { useSessionStorage, readStorage } from "@/hooks/use-web-storage"

const STORAGE_KEY = "kshuri-recently-viewed"
const MAX_ITEMS = 6

interface RecentItem {
  id: string
  slug: string
  name: string
  category: string
  city: string
  rating: number
  timestamp: number
}

const EMPTY: RecentItem[] = []

export function useRecentlyViewed() {
  const [items, setItems] = useSessionStorage<RecentItem[]>(STORAGE_KEY, EMPTY)

  const add = useCallback(
    (vendor: Vendor) => {
      // Read straight from storage so concurrent `add()` calls in the same
      // tick don't clobber each other (useState would race).
      const current = readStorage<RecentItem[]>("session", STORAGE_KEY, EMPTY).filter(
        (item) => item.id !== vendor.id,
      )
      const newItem: RecentItem = {
        id: vendor.id,
        slug: vendor.slug,
        name: vendor.name,
        category: vendor.category,
        city: vendor.city,
        rating: vendor.rating,
        timestamp: Date.now(),
      }
      setItems([newItem, ...current].slice(0, MAX_ITEMS))
    },
    [setItems],
  )

  return { items, add }
}
