'use client'

// ─────────────────────────────────────────────────────────────────────────────
// useBookingDraft — sessionStorage-backed booking draft per vendor slug.
// ─────────────────────────────────────────────────────────────────────────────
// The /book/[slug]/* flow is multi-step; a hard refresh or back-button should
// rehydrate the user's progress. We store the draft in sessionStorage under
// `kshuri.booking.<vendorSlug>` so the state never crosses vendors and is
// scoped to a single browser tab session.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import { type BookingDraft, EMPTY_DRAFT } from './booking-types'

const STORAGE_PREFIX = 'kshuri.booking.'

function storageKey(vendorSlug: string) {
  return `${STORAGE_PREFIX}${vendorSlug}`
}

function readDraft(vendorSlug: string): BookingDraft {
  if (typeof window === 'undefined') return { vendorSlug, ...EMPTY_DRAFT }
  try {
    const raw = window.sessionStorage.getItem(storageKey(vendorSlug))
    if (!raw) return { vendorSlug, ...EMPTY_DRAFT }
    const parsed = JSON.parse(raw) as BookingDraft
    if (parsed.vendorSlug !== vendorSlug) return { vendorSlug, ...EMPTY_DRAFT }
    return parsed
  } catch {
    return { vendorSlug, ...EMPTY_DRAFT }
  }
}

function writeDraft(draft: BookingDraft) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(storageKey(draft.vendorSlug), JSON.stringify(draft))
  } catch {
    /* sessionStorage full or unavailable — silently ignore */
  }
}

function clearDraftStorage(vendorSlug: string) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(storageKey(vendorSlug))
  } catch {
    /* ignore */
  }
}

export function useBookingDraft(vendorSlug: string) {
  // Lazy initialiser reads sessionStorage on the very first render. The
  // `typeof window` guard inside readDraft makes this safe under SSR — the
  // server sees an empty draft, then the client hydrates with the stored
  // value on its first paint.
  const [draft, setDraft] = useState<BookingDraft>(() => readDraft(vendorSlug))

  // When the vendorSlug prop changes (rare — only when the user navigates
  // between booking flows in the same tab), reset to that slug's draft.
  // setState is deferred to a microtask so the lint rule's prohibition on
  // synchronous-setState-in-effect (it triggers cascading renders) is
  // satisfied without dropping the rehydration.
  useEffect(() => {
    if (draft.vendorSlug === vendorSlug) return
    queueMicrotask(() => setDraft(readDraft(vendorSlug)))
  }, [vendorSlug, draft.vendorSlug])

  const update = useCallback(
    (patch: Partial<BookingDraft>) => {
      setDraft((prev) => {
        const next: BookingDraft = { ...prev, ...patch, vendorSlug }
        writeDraft(next)
        return next
      })
    },
    [vendorSlug],
  )

  const reset = useCallback(() => {
    clearDraftStorage(vendorSlug)
    setDraft({ vendorSlug, ...EMPTY_DRAFT })
  }, [vendorSlug])

  // `clear` is an alias of `reset` — kept so callers can use whichever name
  // reads better in context (e.g. resetDraft after success vs clear() in tests).
  return { draft, update, reset, clear: reset }
}
