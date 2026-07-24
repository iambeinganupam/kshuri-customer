"use client"

import { useCallback } from "react"
import { useLocalStorage } from "@/hooks/use-web-storage"

const STORAGE_KEY = "kshuri-wishlist"
const EMPTY: string[] = []

export function useWishlist() {
  const [ids, setIds] = useLocalStorage<string[]>(STORAGE_KEY, EMPTY)

  const toggle = useCallback(
    (vendorId: string) => {
      setIds(
        ids.includes(vendorId)
          ? ids.filter((id) => id !== vendorId)
          : [...ids, vendorId],
      )
    },
    [ids, setIds],
  )

  const has = useCallback((vendorId: string) => ids.includes(vendorId), [ids])

  const remove = useCallback(
    (vendorId: string) => {
      setIds(ids.filter((id) => id !== vendorId))
    },
    [ids, setIds],
  )

  const clear = useCallback(() => setIds(EMPTY), [setIds])

  return { ids, count: ids.length, toggle, has, remove, clear }
}
