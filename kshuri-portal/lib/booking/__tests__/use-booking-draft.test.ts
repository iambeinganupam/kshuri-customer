import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useBookingDraft } from '../use-booking-draft'

beforeEach(() => {
  window.sessionStorage.clear()
})

describe('useBookingDraft', () => {
  it('starts with empty draft for a fresh vendor', () => {
    const { result } = renderHook(() => useBookingDraft('vendor-a'))
    expect(result.current.draft.selectedServiceIds).toEqual([])
    expect(result.current.draft.vendorSlug).toBe('vendor-a')
  })

  it('persists update to sessionStorage', () => {
    const { result } = renderHook(() => useBookingDraft('vendor-a'))
    act(() => result.current.update({ selectedServiceIds: ['s1', 's2'] }))
    expect(result.current.draft.selectedServiceIds).toEqual(['s1', 's2'])
    const stored = JSON.parse(
      window.sessionStorage.getItem('kshuri.booking.vendor-a')!,
    )
    expect(stored.selectedServiceIds).toEqual(['s1', 's2'])
  })

  it('hydrates from sessionStorage on remount with same vendor', () => {
    window.sessionStorage.setItem(
      'kshuri.booking.vendor-a',
      JSON.stringify({ vendorSlug: 'vendor-a', selectedServiceIds: ['existing'] }),
    )
    const { result } = renderHook(() => useBookingDraft('vendor-a'))
    expect(result.current.draft.selectedServiceIds).toEqual(['existing'])
  })

  it('ignores stale draft when vendorSlug differs', () => {
    window.sessionStorage.setItem(
      'kshuri.booking.vendor-a',
      JSON.stringify({ vendorSlug: 'vendor-a', selectedServiceIds: ['leak'] }),
    )
    const { result } = renderHook(() => useBookingDraft('vendor-b'))
    expect(result.current.draft.selectedServiceIds).toEqual([])
  })

  it('clear() removes the sessionStorage entry', () => {
    const { result } = renderHook(() => useBookingDraft('vendor-a'))
    act(() => result.current.update({ selectedServiceIds: ['s1'] }))
    act(() => result.current.clear())
    expect(result.current.draft.selectedServiceIds).toEqual([])
    expect(window.sessionStorage.getItem('kshuri.booking.vendor-a')).toBeNull()
  })
})
