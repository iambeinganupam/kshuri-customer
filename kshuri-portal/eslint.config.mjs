// ─────────────────────────────────────────────────────────────────────────────
// ESLint flat config — @kshuri/portal (Next.js 16)
// ─────────────────────────────────────────────────────────────────────────────
// Uses Next 16's native flat-config exports. No FlatCompat shim needed.
// ─────────────────────────────────────────────────────────────────────────────

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "out/**",
      ".vercel/**",
      ".turbo/**",
    ],
  },
  {
    // Test scaffolding (mocks, stubs) routinely uses `any` for cast helpers.
    // Production code still enforces no-explicit-any via the inherited config.
    files: ["**/__tests__/**", "**/*.test.{ts,tsx}", "tests/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default config;
