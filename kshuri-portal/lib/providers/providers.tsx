'use client'

// ─────────────────────────────────────────────────────────────────────────────
// ClientProviders — wraps the app in:
//   1. QueryClientProvider (React Query)
//   2. ApiClientProvider (@kshuri/api-client) bound to the existing axios
//      instance from lib/api/client.ts. We do NOT create a second axios.
//   3. AuthProvider (existing) — stays inside the api-client provider so any
//      auth-triggered fetches go through the shared axios.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiClientProvider } from '@kshuri/api-client'
import { apiClient } from '@/lib/api/client'
import { AuthProvider } from '@/lib/auth/auth-context'

export function ClientProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ApiClientProvider client={apiClient}>
        <AuthProvider>{children}</AuthProvider>
      </ApiClientProvider>
    </QueryClientProvider>
  )
}
