// ─────────────────────────────────────────────────────────────────────────────
// Feature flags — single source of truth for env-driven feature gating.
// Evaluated once at module load. Every gating site (route guards, nav-link
// filters, page sections) imports from here so flipping one env var toggles
// the entire surface consistently.
// ─────────────────────────────────────────────────────────────────────────────

/** When true, wedding-only routes and nav items are visible. Default off —
 *  the current release ships daily grooming only. The full wedding feature
 *  surface (planner, checklist, stories) lives unchanged in code; this flag
 *  is the single switch that exposes it. */
export const WEDDING_FEATURES_ENABLED =
  process.env.NEXT_PUBLIC_WEDDING_FEATURES_ENABLED === 'true'

/** When true, the customer booking flow (/book/[slug]/* + dashboard
 *  transactions + Book Now CTAs) is exposed. Default off — the flow ships
 *  flag-gated for a safe rollout. See Spec 2026-05-23. */
export const CUSTOMER_BOOKING_FLOW_ENABLED =
  process.env.NEXT_PUBLIC_CUSTOMER_BOOKING_FLOW_ENABLED === 'true'
