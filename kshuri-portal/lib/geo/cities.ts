// Minimal city-name → city-slug lookup. Used by the routing middleware to map
// Vercel's edge geolocation `city` (Title Case, sometimes English-only) to the
// slug we use in URLs. Expand as new markets come online.
const CITY_TO_SLUG: Record<string, string> = {
  mumbai: 'mumbai',
  delhi: 'delhi',
  'new delhi': 'delhi',
  bengaluru: 'bengaluru',
  bangalore: 'bengaluru',
  hyderabad: 'hyderabad',
  chennai: 'chennai',
  kolkata: 'kolkata',
  pune: 'pune',
  ahmedabad: 'ahmedabad',
  jaipur: 'jaipur',
  lucknow: 'lucknow',
  chandigarh: 'chandigarh',
  surat: 'surat',
  kanpur: 'kanpur',
  nagpur: 'nagpur',
};

/** Returns null when no canonical slug is known for the input. Callers fall
 *  back to a default (typically 'mumbai'). */
export function citySlugFromName(name: string): string | null {
  if (!name) return null;
  return CITY_TO_SLUG[name.trim().toLowerCase()] ?? null;
}
