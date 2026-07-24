import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getFlag } from '../flags';

describe('getFlag', () => {
  const KEY = 'NEXT_PUBLIC_R1_DISCOVERY_V2';
  const original = process.env[KEY];

  beforeEach(() => { delete process.env[KEY]; });
  afterEach(() => { if (original !== undefined) process.env[KEY] = original; });

  it('returns false when the env var is unset', () => {
    expect(getFlag('R1_DISCOVERY_V2')).toBe(false);
  });

  it('returns true when the env var is "true"', () => {
    process.env[KEY] = 'true';
    expect(getFlag('R1_DISCOVERY_V2')).toBe(true);
  });

  it('returns true when the env var is "1"', () => {
    process.env[KEY] = '1';
    expect(getFlag('R1_DISCOVERY_V2')).toBe(true);
  });

  it('returns false for any other value', () => {
    process.env[KEY] = 'TRUE';
    expect(getFlag('R1_DISCOVERY_V2')).toBe(false);
    process.env[KEY] = 'yes';
    expect(getFlag('R1_DISCOVERY_V2')).toBe(false);
  });
});
