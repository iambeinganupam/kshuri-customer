'use client';

import { useEffect, useState } from 'react';
import type { GeoCookie } from './types';

const CK = 'kshuri_geo';

function readClient(): GeoCookie | null {
  if (typeof document === 'undefined') return null;
  const raw = document.cookie.split('; ').find(c => c.startsWith(`${CK}=`));
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw.split('=')[1])) as GeoCookie;
  } catch {
    return null;
  }
}

export function useGeo(): GeoCookie | null {
  const [geo, setGeo] = useState<GeoCookie | null>(null);
  // Deferred read avoids hydration mismatch — document.cookie isn't available
  // during SSR, so we must populate after mount even though it triggers one
  // extra render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setGeo(readClient()); }, []);
  return geo;
}

/** Updates the kshuri_geo cookie via the /api/geo/set endpoint and mirrors
 *  the value in document.cookie so subsequent useGeo reads pick it up. */
export async function setGeo(g: Omit<GeoCookie, 'ts'>): Promise<void> {
  await fetch('/api/geo/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(g),
  });
  if (typeof document !== 'undefined') {
    document.cookie = `${CK}=${encodeURIComponent(JSON.stringify({ ...g, ts: Date.now() }))}; path=/; max-age=2592000; samesite=lax; secure`;
  }
}
