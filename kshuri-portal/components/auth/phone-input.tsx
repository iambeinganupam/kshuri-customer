"use client"

// ─────────────────────────────────────────────────────────────────────────────
// PhoneInput — fixed +91 chip + 10-digit numeric input
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for how the portal captures Indian mobile numbers.
// Owns digit-only sanitization and the validation-hint line.
// ─────────────────────────────────────────────────────────────────────────────

import { Input } from "@/components/ui/input"
import { Phone } from "lucide-react"

const PHONE_RE = /^[6-9]\d{9}$/

export function isValidIndianMobile(digits: string): boolean {
  return PHONE_RE.test(digits)
}

interface PhoneInputProps {
  value: string
  onChange: (digits: string) => void
  disabled?: boolean
  autoFocus?: boolean
}

export function PhoneInput({ value, onChange, disabled, autoFocus }: PhoneInputProps) {
  const valid = isValidIndianMobile(value)
  const showError = value.length > 0 && !valid

  return (
    <div>
      <label className="text-[13px] font-semibold text-foreground mb-2.5 block">
        Phone Number
      </label>
      <div className="flex items-stretch gap-2">
        <div
          aria-hidden
          className="grid h-12 place-items-center rounded-xl border border-border/50 bg-muted/50 px-3 text-sm font-medium text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <Phone className="h-4 w-4 text-muted-foreground/70" /> +91
          </span>
        </div>
        <Input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          placeholder="98765 43210"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
          disabled={disabled}
          autoFocus={autoFocus}
          className="h-12 flex-1 rounded-xl bg-muted/30 border-border/50 tracking-wider"
        />
      </div>
      <p
        className={`mt-1.5 text-xs ${
          showError ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {showError
          ? "Enter a 10-digit Indian mobile starting with 6, 7, 8, or 9."
          : "10-digit mobile, no spaces."}
      </p>
    </div>
  )
}
