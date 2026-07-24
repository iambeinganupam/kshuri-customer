"use client"

// ─────────────────────────────────────────────────────────────────────────────
// AuthContext — @kshuri/portal (Customer)
// ─────────────────────────────────────────────────────────────────────────────
// In-memory access token + refresh-cookie-driven silent refresh on mount.
//
// Lifecycle:
//   1. Provider mounts → POSTs /auth/refresh.
//      * 200 → store access token, fetch /auth/me, mark authenticated.
//      * Any other → mark anonymous (no surface error — silent).
//   2. After login/signup → setAuthUser(user, accessToken) populates state.
//   3. Logout → POST /auth/logout, clear access token + user, redirect /login.
//
// Access tokens never touch localStorage. Refresh cookie is httpOnly and
// scoped to the `customer` audience (backend sets `kshuri_rt_customer`).
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import {
  getMe,
  logout as apiLogout,
  silentRefresh,
  type AuthUser,
} from "@/lib/api/auth"
import { tokenManager } from "@/lib/api/client"

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  setAuthUser: (user: AuthUser, accessToken: string) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const setAuthUser = useCallback((user: AuthUser, accessToken: string) => {
    tokenManager.set(accessToken)
    setState({ user, isAuthenticated: true, isLoading: false })
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Server may already have invalidated the session — drop locally either way.
    } finally {
      tokenManager.clear()
      setState({ user: null, isAuthenticated: false, isLoading: false })
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { access_token } = await silentRefresh()
        tokenManager.set(access_token)
        const user = await getMe()
        if (cancelled) return
        setState({ user, isAuthenticated: true, isLoading: false })
      } catch {
        if (cancelled) return
        tokenManager.clear()
        setState({ user: null, isAuthenticated: false, isLoading: false })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, setAuthUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>")
  return ctx
}
