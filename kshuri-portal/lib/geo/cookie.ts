import { cookies } from 'next/headers';
import type { GeoCookie } from './types';

export const GEO_COOKIE = 'kshuri_geo';

/** Server-side read. Returns null when the cookie is missing or malformed. */
export async function readGeoCookie(): Promise<GeoCookie | null> {
  const store = await cookies();
  const c = store.get(GEO_COOKIE);
  if (!c) return null;
  try {
    return JSON.parse(decodeURIComponent(c.value)) as GeoCookie;
  } catch {
    return null;
  }
}
