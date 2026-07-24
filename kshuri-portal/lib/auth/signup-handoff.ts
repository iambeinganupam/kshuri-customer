// ─────────────────────────────────────────────────────────────────────────────
// Login → Signup handoff
// ─────────────────────────────────────────────────────────────────────────────
// When /login's lookup_only probe returns AUTH_PHONE_NOT_REGISTERED we hand
// the user (with their just-verified Firebase ID token) over to /signup so
// they don't have to re-OTP seconds later. Cross-route state in App Router
// can't use react-router-dom's location.state; sessionStorage survives the
// navigation cleanly and is wiped by signup on first read.
//
// Firebase ID tokens live for 1 hour. Treat anything older than 50 minutes
// as untrusted so we never submit a near-expiry token to the backend.
// ─────────────────────────────────────────────────────────────────────────────

export const SIGNUP_HANDOFF_KEY = "kshuri:portal:signup-handoff"

export const HANDOFF_TTL_MS = 50 * 60 * 1000

export interface SignupHandoff {
  phone: string
  idToken: string
  idTokenIssuedAt: number
  redirect: string
}

export function readSignupHandoff(): SignupHandoff | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(SIGNUP_HANDOFF_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SignupHandoff
    if (Date.now() - data.idTokenIssuedAt > HANDOFF_TTL_MS) {
      sessionStorage.removeItem(SIGNUP_HANDOFF_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

export function writeSignupHandoff(handoff: SignupHandoff) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(SIGNUP_HANDOFF_KEY, JSON.stringify(handoff))
  } catch {
    // Quota / private-mode block — caller falls back to a fresh OTP.
  }
}

export function clearSignupHandoff() {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(SIGNUP_HANDOFF_KEY)
  } catch {
    // ignore
  }
}
