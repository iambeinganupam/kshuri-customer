// ─────────────────────────────────────────────────────────────────────────────
// Sentry — browser SDK (Next 16 App Router)
// ─────────────────────────────────────────────────────────────────────────────
// Conditional init: only runs when NEXT_PUBLIC_SENTRY_DSN is set, so
// developer machines without a DSN never ping Sentry.
// ─────────────────────────────────────────────────────────────────────────────

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
    debug: false,
  });
}
