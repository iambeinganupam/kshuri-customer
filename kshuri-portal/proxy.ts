// ─────────────────────────────────────────────────────────────────────────────
// Request Proxy (Next 16 — replaces the deprecated `middleware.ts` convention)
// ─────────────────────────────────────────────────────────────────────────────
// Applied to every request that matches the `config.matcher` glob below.
//
// Responsibilities:
//   1. Hide gated wedding-only routes when NEXT_PUBLIC_WEDDING_FEATURES_ENABLED
//      is off — returns 404 at the routing layer so the page bodies never
//      render. The wedding-page implementations stay intact in source; this
//      flag is the single switch that exposes them in a future release.
//   2. Set Content-Security-Policy header (XSS / injection mitigation).
//   3. Strip server-identifying headers (anti-fingerprinting).
//   4. Gate customer-only routes on presence of the audience refresh cookie.
//      Cookie presence ≠ validity — backend validates on /auth/refresh.
//      Treating the cookie as a hint avoids round-tripping to the API for
//      every page request and is consistent with how the sibling dashboards
//      handle auth gating.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from 'next/server';
import { geolocation } from '@vercel/functions';
import { citySlugFromName } from '@/lib/geo/cities';

// Routes only visible to a signed-in customer. Public marketing pages
// (/, /vendors, /services, /stories, /contact, /compare) stay anonymous.
const PROTECTED_PATHS = [
  '/dashboard',
  '/wishlist',
  '/checklist',
  '/planner',
  '/vendor-portal', // route group (vendor) renders at /vendor-portal
  '/book',          // customer booking flow (Spec 2026-05-23)
];

// Wedding-only routes — hidden in releases where wedding features are off.
// Centralised here (not duplicated across pages) so the single-source-of-truth
// flag at lib/feature-flags.ts toggles the entire surface consistently.
// See: docs/superpowers/plans/2026-05-21-portal-pivot-phase-4-wedding-gating.md.
const WEDDING_PATHS = ['/planner', '/checklist', '/stories'];
const WEDDING_FEATURES_ENABLED =
  process.env.NEXT_PUBLIC_WEDDING_FEATURES_ENABLED === 'true';

// Backend names the refresh cookie `kshuri_rt_<audience>` —
// see backend/src/lib/audiences.ts.
const CUSTOMER_REFRESH_COOKIE = 'kshuri_rt_customer';

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isWeddingRoute(pathname: string): boolean {
  return WEDDING_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // ── 1. Wedding-feature gate (hide /planner /checklist /stories when off) ──
  // Returns a plain 404 from the edge — Next.js does not invoke the page's
  // server component, so its implementation stays cold but intact in source.
  if (!WEDDING_FEATURES_ENABLED && isWeddingRoute(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  // ── 2. Auth gate (cookie presence check only) ─────────────────────────────
  if (isProtected(pathname)) {
    const cookie = request.cookies.get(CUSTOMER_REFRESH_COOKIE);
    if (!cookie?.value) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname + search);
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();

  // ── 3. Geo cookie (first-hit only) ────────────────────────────────────────
  // Seed `kshuri_geo` from Vercel's edge geolocation so the marketplace can
  // render city-scoped content on the very first server render. The cookie is
  // client-readable (httpOnly:false) so the client `useGeo()` hook can pick it
  // up without a round-trip. Users override via POST /api/geo/set or the city
  // switcher; we only set when the cookie is missing.
  if (!request.cookies.get('kshuri_geo')) {
    const { city, country, latitude, longitude } = geolocation(request);
    const value = JSON.stringify({
      city:   citySlugFromName(city ?? '') ?? 'mumbai',
      region: country ?? 'IN',
      lat:    Number(latitude  ?? 19.0760),
      lng:    Number(longitude ?? 72.8777),
      source: 'ip' as const,
      ts:     Date.now(),
    });
    response.cookies.set('kshuri_geo', value, {
      httpOnly: false, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 30,
    });
  }

  // ── 2. Content Security Policy ────────────────────────────────────────────
  // `script-src-elem` is set explicitly — Vercel Analytics fails silently
  // under script-src fallback. 'unsafe-eval' is required by Turbopack dev;
  // production deploys can override to a stricter value if desired.
  //
  // www.gstatic.com is the host for Google's reCAPTCHA script, loaded by
  // Firebase's signInWithPhoneNumber. www.google.com hosts the reCAPTCHA
  // challenge iframe (frame-src).
  const SCRIPT_SOURCES =
    "'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://www.gstatic.com https://www.google.com https://apis.google.com";

  const csp = [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `script-src ${SCRIPT_SOURCES}`,
    `script-src-elem ${SCRIPT_SOURCES}`,
    // Image sources: own assets + Supabase storage CDN (vendor profile media
    // still served from there until media-upload backend handles it).
    "img-src 'self' data: blob: https://*.supabase.co https://res.cloudinary.com https://images.unsplash.com https://*.googleusercontent.com https://www.gstatic.com https://www.google.com",
    // Backend API + Firebase identity endpoints. https://*.estylr.com is a
    // wildcard for production deploys.
    "connect-src 'self' http://localhost:3001 https://kshuri-backend.onrender.com https://*.estylr.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com",
    // Firebase phone auth uses a reCAPTCHA iframe hosted by Google.
    "frame-src https://*.firebaseapp.com https://www.google.com https://recaptcha.net",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.delete('X-Powered-By');

  return response;
}

export const config = {
  // Apply to all routes except Next internals and static assets.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
