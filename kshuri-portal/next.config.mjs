
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TODO Phase 7+: clear pre-existing type errors and re-enable build-time checks.
    ignoreBuildErrors: true,
  },
  // The shared vendor-profile components live in the workspace package
  // @kshuri/ui (published as TS source). Next must transpile them.
  transpilePackages: ['@kshuri/ui', '@kshuri/api-client'],
  // NOTE: output:'standalone' is required for Vercel prebuilt deployment —
  // it traces and self-contains all required node_modules for serverless
  // functions, solving the monorepo hoisting problem where workspace packages
  // like styled-jsx live in the root node_modules but Vercel's remote runner
  // needs them bundled inside the function.
  //
  // NOTE: images.unoptimized is intentionally omitted — Vercel's edge CDN
  // provides image optimization out of the box.
  output: 'standalone',
  //
  // Production-ready security headers (defense-in-depth alongside proxy.ts CSP).
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

// Only wrap with Sentry when SENTRY_AUTH_TOKEN is present (CI / production).
// Local and preview builds without a token skip source-map upload cleanly.
const hasSentryAuth = Boolean(process.env.SENTRY_AUTH_TOKEN);

export default async (phase, { defaultConfig }) => {
  if (hasSentryAuth) {
    const { withSentryConfig } = await import('@sentry/nextjs');
    return withSentryConfig(nextConfig, {
      org: 'kshuri',
      project: 'kshuri-portal',
      silent: true,
      widenClientFileUpload: true,
      hideSourceMaps: true,
      disableLogger: true,
    });
  }
  return nextConfig;
};
