// ─────────────────────────────────────────────────────────────────────────────
// API client — @kshuri/portal
// ─────────────────────────────────────────────────────────────────────────────
// Axios instance pre-configured for the Kshuri backend (`/api/v1`).
//
// Works in both React Server Components (server-side fetch over Node) and
// Client Components (browser fetch). Browser callers automatically include
// the audience header so backend /auth/* endpoints scope refresh-token
// cookies per dashboard.
//
// Access token is held in an in-memory cell (no localStorage — keeps the
// token out of XSS reach). An axios request interceptor attaches it as
// `Authorization: Bearer …` on every outbound call. The AuthProvider
// (lib/auth/auth-context.tsx) is the sole writer.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1"

let accessToken: string | null = null

export const tokenManager = {
  set(token: string | null) {
    accessToken = token
  },
  get(): string | null {
    return accessToken
  },
  clear() {
    accessToken = null
  },
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "X-Kshuri-Audience": "customer",
  },
})

apiClient.interceptors.request.use((config) => {
  const token = tokenManager.get()
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
  }
  return config
})

/** Generic backend envelope returned by every successful endpoint. */
export interface ApiSuccess<T> {
  success: true
  data: T
  meta?: { has_more?: boolean } & Record<string, unknown>
}
