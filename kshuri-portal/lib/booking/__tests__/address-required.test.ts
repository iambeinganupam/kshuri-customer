import { describe, expect, it } from 'vitest'
import { addressRequired } from '../address-required'

describe('addressRequired', () => {
  it('returns false for empty selection', () => {
    expect(addressRequired([])).toBe(false)
  })

  it('returns false when all services are onsite', () => {
    expect(
      addressRequired([{ service_location: 'onsite' }, { service_location: 'onsite' }]),
    ).toBe(false)
  })

  it('returns true when any service is home', () => {
    expect(
      addressRequired([{ service_location: 'onsite' }, { service_location: 'home' }]),
    ).toBe(true)
  })

  it('returns true when any service is both', () => {
    expect(addressRequired([{ service_location: 'both' }])).toBe(true)
  })
})
