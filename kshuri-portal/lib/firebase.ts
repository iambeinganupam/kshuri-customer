// ─────────────────────────────────────────────────────────────────────────────
// Firebase init — @kshuri/portal
// ─────────────────────────────────────────────────────────────────────────────
// Browser-only — imported by the Phase 4 phone-OTP login/signup hook.
// Initializes a singleton Firebase app + auth instance.
// Mirrors the pattern in the freelancer + salon dashboards so the three
// surfaces stay aligned and can promote to a shared package later.
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const firebaseConfig = {
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-firebase-api-key-for-prerendering"),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project-id",
};

// Next dev hot-reload may re-execute this module; guard against double init.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
