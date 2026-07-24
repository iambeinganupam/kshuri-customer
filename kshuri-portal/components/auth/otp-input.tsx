"use client"

// ─────────────────────────────────────────────────────────────────────────────
// OtpInput — 6-slot OTP entry wrapper around shadcn InputOTP
// ─────────────────────────────────────────────────────────────────────────────

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface OtpInputProps {
  value: string
  onChange: (digits: string) => void
  autoFocus?: boolean
}

export function OtpInput({ value, onChange, autoFocus }: OtpInputProps) {
  return (
    <InputOTP maxLength={6} value={value} onChange={onChange} autoFocus={autoFocus} className="gap-2">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}
