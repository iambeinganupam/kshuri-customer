"use client"

// ─────────────────────────────────────────────────────────────────────────────
// RoleMismatchAlert — shown when the backend returns AUTH_ROLE_MISMATCH
// after the customer login's `lookup_only` probe.
// ─────────────────────────────────────────────────────────────────────────────
// Never discloses which role the existing account has — the portal is the
// public entry point and users shouldn't be deep-linked into vendor/admin
// dashboards. CTA is reset-only.
// ─────────────────────────────────────────────────────────────────────────────

import { ShieldAlert } from "lucide-react"

interface RoleMismatchAlertProps {
  onReset: () => void
}

export function RoleMismatchAlert({ onReset }: RoleMismatchAlertProps) {
  return (
    <div
      role="alert"
      className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
        </div>
        <div className="flex-1 space-y-2.5">
          <div>
            <p className="text-sm font-semibold text-foreground">
              This number is registered with a different Kshuri account
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Please sign in from the dashboard tied to that account, or try a different number.
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center rounded-lg px-3 py-2 text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            Try a different number
          </button>
        </div>
      </div>
    </div>
  )
}
