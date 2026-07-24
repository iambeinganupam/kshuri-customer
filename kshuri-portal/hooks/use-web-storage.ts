"use client"

// ─────────────────────────────────────────────────────────────────────────────
// useLocalStorage / useSessionStorage — SSR-safe, hydration-safe
// ─────────────────────────────────────────────────────────────────────────────
// Built on top of React 18's useSyncExternalStore so we never trigger the
// react-hooks/set-state-in-effect lint rule (Next 16 / React Compiler).
//
// Pattern:
//   const [val, setVal] = useLocalStorage<string[]>("kshuri-wishlist", [])
//
// Cross-tab + same-tab updates both notify subscribers via a private
// CustomEvent (browsers fire `storage` only on *other* tabs).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useMemo, useSyncExternalStore } from "react"

type Storage = "local" | "session"

const SAME_TAB_EVENT = "kshuri:web-storage"

function getStorage(kind: Storage): globalThis.Storage | null {
  if (typeof window === "undefined") return null
  return kind === "local" ? window.localStorage : window.sessionStorage
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("storage", callback)
  window.addEventListener(SAME_TAB_EVENT, callback)
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(SAME_TAB_EVENT, callback)
  }
}

function read<T>(kind: Storage, key: string, fallback: T): T {
  const storage = getStorage(kind)
  if (!storage) return fallback
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function notifySameTab() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(SAME_TAB_EVENT))
}

function useWebStorage<T>(kind: Storage, key: string, fallback: T): readonly [T, (next: T) => void] {
  const getSnapshot = useCallback(() => {
    const storage = getStorage(kind)
    if (!storage) return null
    return storage.getItem(key)
  }, [kind, key])

  // Server snapshot: always returns the serialized fallback so RSC + first
  // client paint agree. The real value lands after hydration commits.
  const getServerSnapshot = useCallback(() => null, [])

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const value = useMemo<T>(() => {
    if (raw == null) return fallback
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }, [raw, fallback])

  const setValue = useCallback(
    (next: T) => {
      const storage = getStorage(kind)
      if (!storage) return
      try {
        storage.setItem(key, JSON.stringify(next))
        notifySameTab()
      } catch {
        // QuotaExceeded / private-mode storage block — swallow.
      }
    },
    [kind, key],
  )

  return [value, setValue] as const
}

export function useLocalStorage<T>(key: string, fallback: T) {
  return useWebStorage<T>("local", key, fallback)
}

export function useSessionStorage<T>(key: string, fallback: T) {
  return useWebStorage<T>("session", key, fallback)
}

/**
 * Imperative reader for storage values outside React (event handlers, etc.).
 * Subscribers using useLocalStorage/useSessionStorage are notified
 * automatically on the next React tick via the SAME_TAB_EVENT dispatch.
 */
export function readStorage<T>(kind: Storage, key: string, fallback: T): T {
  return read<T>(kind, key, fallback)
}
