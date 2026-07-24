"use client"

// ─────────────────────────────────────────────────────────────────────────────
// Login Page — @kshuri/portal
// ─────────────────────────────────────────────────────────────────────────────
// Phone + OTP is the only path in. Mirrors the freelancer/salon dashboards,
// scoped to the `customer` audience.
//
// Flow:
//   1. User types 10-digit phone → we prepend +91 and call Firebase sendOtp.
//   2. User types 6-digit OTP    → Firebase verifies → we receive an idToken.
//   3. We exchange the idToken with /auth/oauth/firebase-phone in
//      `lookup_only` mode:
//        - 200 → log them in.
//        - 404 AUTH_PHONE_NOT_REGISTERED → silent route to /signup with the
//          verified idToken in router state. Signup honors the handoff and
//          skips Step 1.
//        - 403 AUTH_ROLE_MISMATCH → inline RoleMismatchAlert.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/auth-context"
import {
  verifyFirebasePhone,
  isPhoneNotRegisteredError,
  isRoleMismatchError,
  extractErrorMessage,
} from "@/lib/api/auth"
import { useFirebasePhoneAuth } from "@/hooks/use-firebase-phone-auth"
import { PhoneInput, isValidIndianMobile } from "@/components/auth/phone-input"
import { OtpInput } from "@/components/auth/otp-input"
import { RoleMismatchAlert } from "@/components/auth/role-mismatch-alert"
import { writeSignupHandoff } from "@/lib/auth/signup-handoff"

function safeRedirect(raw: string | null): string {
  if (!raw) return "/"
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/"
  return raw
}

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, setAuthUser } = useAuth()

  const redirectTo = useMemo(
    () => safeRedirect(searchParams.get("redirect")),
    [searchParams],
  )

  const [phone, setPhone] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [roleMismatch, setRoleMismatch] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    sendOtp,
    verifyOtp,
    reset,
    otpSent,
    isLoading: isPhoneAuthLoading,
  } = useFirebasePhoneAuth({ containerId: "login-recaptcha-container" })

  useEffect(() => {
    if (isAuthenticated) router.replace(redirectTo)
  }, [isAuthenticated, redirectTo, router])

  const phoneValid = isValidIndianMobile(phone)

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!phoneValid) {
      toast.error("Enter a valid 10-digit Indian mobile starting with 6-9")
      return
    }
    const result = await sendOtp(`+91${phone}`)
    if (result.success) toast.success("OTP sent! Check your phone.")
    else toast.error("Couldn't send OTP. Please try again.")
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (otpCode.length !== 6) {
      toast.error("Enter the 6-digit OTP")
      return
    }

    const verifyResult = await verifyOtp(otpCode)
    if (!verifyResult.success || !verifyResult.idToken) {
      toast.error("Invalid OTP. Please try again.")
      return
    }

    setIsSubmitting(true)
    setRoleMismatch(false)
    try {
      const authResult = await verifyFirebasePhone({
        id_token: verifyResult.idToken,
        role: "customer",
        lookup_only: true,
      })
      setAuthUser(authResult.user, authResult.access_token)
      toast.success("Welcome back!")
      console.log("Redirecting to:", redirectTo)
console.log("Auth result:", authResult)
      router.replace(redirectTo)
    } catch (err) {
      if (isPhoneNotRegisteredError(err)) {
        // Hand the verified token off to /signup so the user doesn't have
        // to re-OTP seconds later. See lib/auth/signup-handoff.ts for the
        // rationale and TTL.
        writeSignupHandoff({
          phone,
          idToken: verifyResult.idToken,
          idTokenIssuedAt: Date.now(),
          redirect: redirectTo,
        })
        toast.success("Phone verified — let's finish setting up your account.")
        router.push("/signup")
        return
      }
      if (isRoleMismatchError(err)) {
        setRoleMismatch(true)
        return
      }
      toast.error(extractErrorMessage(err, "Sign-in failed after OTP verification."))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleResetMismatch() {
    setRoleMismatch(false)
    reset()
    setOtpCode("")
    setPhone("")
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left branding panel */}
      <div className="hidden md:flex md:w-[45%] relative overflow-hidden bg-card border-r border-border">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-primary/6 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/15 backdrop-blur-sm flex items-center justify-center mb-8 mx-auto border border-primary/20">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-[44px] font-serif font-bold text-foreground leading-[1.1] tracking-tight mb-4">
            Welcome to<br />Kshuri
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            India&apos;s daily grooming marketplace. Discover vendors, pick a slot, book in seconds.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2.5 mb-6 md:hidden">
            <div className="h-11 w-11 rounded-2xl flex items-center justify-center shadow-sm bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-[28px] font-serif font-bold text-foreground tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">
              We&apos;ll send a one-time code to your phone.
            </p>
          </div>

          {roleMismatch && <RoleMismatchAlert onReset={handleResetMismatch} />}

          <div id="login-recaptcha-container" />
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <PhoneInput value={phone} onChange={setPhone} autoFocus />
              <Button
                type="submit"
                disabled={isPhoneAuthLoading || !phoneValid}
                className="w-full h-12 gap-2 font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPhoneAuthLoading ? "Sending…" : "Send OTP"} <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="text-[13px] font-semibold text-foreground mb-2.5 block">
                  Enter 6-digit OTP
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Code sent to <span className="font-medium text-foreground">+91 {phone}</span>
                </p>
                <OtpInput value={otpCode} onChange={setOtpCode} autoFocus />
              </div>
              <Button
                type="submit"
                disabled={isPhoneAuthLoading || isSubmitting || otpCode.length !== 6}
                className="w-full h-12 gap-2 font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPhoneAuthLoading || isSubmitting ? "Verifying…" : "Verify & Sign In"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    reset()
                    setOtpCode("")
                    setRoleMismatch(false)
                  }}
                  className="text-xs text-accent hover:underline font-medium"
                >
                  Use a different number
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-8">
            New to Kshuri?{" "}
            <Link
              href={`/signup${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
              className="font-semibold hover:underline text-accent"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}
