"use client"

import { useState, useCallback } from "react"

const MAX_COMPARE = 3
const STORAGE_KEY = "kshuri-compare"

function getStored(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useCompare() {
  const [ids, setIds] = useState<string[]>(() => getStored())

  const persist = useCallback((next: string[]) => {
    setIds(next)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event("compare-change"))
  }, [])

  const toggle = useCallback(
    (vendorId: string) => {
      const current = getStored()
      if (current.includes(vendorId)) {
        persist(current.filter((id) => id !== vendorId))
      } else if (current.length < MAX_COMPARE) {
        persist([...current, vendorId])
      }
    },
    [persist]
  )

  const has = useCallback(
    (vendorId: string) => ids.includes(vendorId),
    [ids]
  )

  const remove = useCallback(
    (vendorId: string) => persist(getStored().filter((id) => id !== vendorId)),
    [persist]
  )

  const clear = useCallback(() => persist([]), [persist])

  return { ids, count: ids.length, toggle, has, remove, clear, isFull: ids.length >= MAX_COMPARE }
}
