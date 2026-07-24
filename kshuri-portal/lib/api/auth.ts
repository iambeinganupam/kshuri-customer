// ─────────────────────────────────────────────────────────────────────────────
// API Module — Auth (@kshuri/portal)
// Backend: /api/v1/auth/* (audience: customer)
// ─────────────────────────────────────────────────────────────────────────────
// Phone-OTP only. The portal hands a Firebase ID token to the backend at
// /auth/oauth/firebase-phone and receives a Kshuri JWT + httpOnly refresh
// cookie scoped to the `customer` audience.
//
// The four exported functions are deliberately the entire portal auth
// surface. To re-add Google later, add a googleOAuth() here matching the
// same shape, then drop a Google button into login/signup pages.
// ─────────────────────────────────────────────────────────────────────────────

import { apiClient, type ApiSuccess } from "./client"

// ── Public types ────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string | null
  phone_number: string | null
  role: "customer"
  first_name: string
  last_name: string
  avatar_url: string | null
  created_at: string
}

export interface AuthTokenResponse {
  access_token: string
  user: AuthUser
  is_new_user?: boolean
}

export interface VerifyFirebasePhoneBody {
  id_token: string
  role: "customer"
  /** Probe-only: backend returns 404 if no customer exists for this phone. */
  lookup_only?: boolean
  /** Signup submit guard: backend rejects with 409 if phone already on file. */
  is_signup?: boolean
  first_name?: string
  last_name?: string
}

export interface ProfileUpdatePayload {
  first_name?: string
  last_name?: string
  avatar_url?: string
  date_of_birth?: string
  gender_preference?: "male" | "female" | "any"
  marketing_opt_in?: boolean
}

// ── Backend error helpers ───────────────────────────────────────────────────

interface AxiosLikeError {
  response?: {
    status?: number
    data?: { error?: { code?: string; message?: string } }
  }
}

function errorCode(err: unknown): string | undefined {
  return (err as AxiosLikeError)?.response?.data?.error?.code
}

export function isPhoneNotRegisteredError(err: unknown): boolean {
  return errorCode(err) === "AUTH_PHONE_NOT_REGISTERED"
}

export function isRoleMismatchError(err: unknown): boolean {
  return errorCode(err) === "AUTH_ROLE_MISMATCH"
}

export function isPhoneAlreadyExistsError(err: unknown): boolean {
  return errorCode(err) === "AUTH_PHONE_EXISTS"
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  return (err as AxiosLikeError)?.response?.data?.error?.message ?? fallback
}

// ── API functions ───────────────────────────────────────────────────────────

/**
 * AUTH-11: Exchange a Firebase phone ID token for a Kshuri session.
 *
 * Three call shapes:
 *   1. Login probe   → { id_token, role: 'customer', lookup_only: true }
 *   2. Signup submit → { id_token, role: 'customer', is_signup: true, first_name, last_name }
 *   3. Implicit login (legacy) → { id_token, role: 'customer' }
 */
export async function verifyFirebasePhone(
  body: VerifyFirebasePhoneBody,
): Promise<AuthTokenResponse> {
  const { data } = await apiClient.post<ApiSuccess<AuthTokenResponse>>(
    "/auth/oauth/firebase-phone",
    body,
  )
  return data.data
}

/** AUTH-05: Exchange the refresh cookie for a fresh access token. */
export async function silentRefresh(): Promise<{ access_token: string }> {
  const { data } = await apiClient.post<ApiSuccess<{ access_token: string }>>(
    "/auth/refresh",
  )
  return data.data
}

/** AUTH-06: Current user. Requires Authorization: Bearer set by the api client. */
export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiSuccess<AuthUser>>("/auth/me")
  return data.data
}

/** AUTH-07: Update customer profile. */
export async function updateMe(payload: ProfileUpdatePayload): Promise<AuthUser> {
  const { data } = await apiClient.put<ApiSuccess<AuthUser>>("/auth/me", payload)
  return data.data
}

/** AUTH-09: Server-side logout — clears the httpOnly refresh cookie. */
export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout")
}
