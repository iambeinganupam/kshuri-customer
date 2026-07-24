"use client"

// ─────────────────────────────────────────────────────────────────────────────
// Signup Page — @kshuri/portal
// ─────────────────────────────────────────────────────────────────────────────
// Two-step onboarding for customers:
//   1. Phone Verification (Firebase phone OTP → idToken; probe backend in
//      lookup_only mode — if an account already exists, log them in and
//      skip Step 2 entirely).
//   2. Name (single full-name input).
// On Step 2 submit we POST /auth/oauth/firebase-phone with role='customer',
// is_signup: true, and the captured first/last name. Address, email, DOB,
// gender and marketing opt-in are deferred to the customer dashboard /
// booking flow.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowRight, Sparkles, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth/auth-context"
import {
  verifyFirebasePhone,
  isPhoneNotRegisteredError,
  isRoleMismatchError,
  isPhoneAlreadyExistsError,
  extractErrorMessage,
} from "@/lib/api/auth"
import { useFirebasePhoneAuth } from "@/hooks/use-firebase-phone-auth"
import { PhoneInput, isValidIndianMobile } from "@/components/auth/phone-input"
import { OtpInput } from "@/components/auth/otp-input"
import {
  readSignupHandoff,
  clearSignupHandoff,
  HANDOFF_TTL_MS,
} from "@/lib/auth/signup-handoff"

const TOTAL_STEPS = 2
const STEP_LABELS = ["Verify your phone", "Your name"]

function safeRedirect(raw: string | null): string {
  if (!raw) return "/"
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/"
  return raw
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8">
      <p className="text-sm text-muted-foreground mb-3">
        Step {current} of {total} — {STEP_LABELS[current - 1]}
      </p>
      <div className="flex gap-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < current ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function SignupInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, setAuthUser } = useAuth()

  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [idToken, setIdToken] = useState("")
  const [idTokenIssuedAt, setIdTokenIssuedAt] = useState(0)
  const [fullName, setFullName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  // `redirect` resolves from query string first, then handoff. Honoring the
  // handoff lets /login pass through the user's original ?redirect target.
  const [resolvedRedirect, setResolvedRedirect] = useState(() =>
    safeRedirect(searchParams.get("redirect")),
  )

  const redirectTo = useMemo(() => resolvedRedirect, [resolvedRedirect])

  const {
    sendOtp,
    verifyOtp,
    reset,
    otpSent,
    isLoading: isPhoneAuthLoading,
  } = useFirebasePhoneAuth({ containerId: "signup-recaptcha-container" })

  useEffect(() => {
    if (isAuthenticated) router.replace(redirectTo)
  }, [isAuthenticated, redirectTo, router])

  // ── On mount: honor any in-flight OTP handoff from /login. The user
  // already verified their phone seconds ago — re-OTPing is friction with
  // no security benefit. The handoff also carries the original `redirect`.
  //
  // The setState batch runs in a microtask so React doesn't see synchronous
  // setStates inside the effect (would trip react-hooks/set-state-in-effect
  // under React 19 / Next 16). One render after the effect returns.
  useEffect(() => {
    const handoff = readSignupHandoff()
    if (!handoff) return
    clearSignupHandoff()
    queueMicrotask(() => {
      setPhone(handoff.phone.replace(/^\+?91/, "").replace(/\D/g, "").slice(0, 10))
      setIdToken(handoff.idToken)
      setIdTokenIssuedAt(handoff.idTokenIssuedAt)
      setStep(2)
      if (handoff.redirect && handoff.redirect !== "/") {
        setResolvedRedirect(handoff.redirect)
      }
      toast.success("Phone verified — let's finish setting up your account.")
    })
  }, [])

  const phoneValid = isValidIndianMobile(phone)

  async function handleSendOtp() {
    if (!phoneValid) {
      toast.error("Enter a valid 10-digit Indian mobile starting with 6-9")
      return
    }
    const result = await sendOtp(`+91${phone}`)
    if (result.success) toast.success("OTP sent!")
    else toast.error("Couldn't send OTP. Please try again.")
  }

  async function handleVerifyOtp() {
    if (otpCode.length !== 6) {
      toast.error("Enter the 6-digit OTP")
      return
    }
    const result = await verifyOtp(otpCode)
    if (!result.success || !result.idToken) {
      toast.error("Invalid OTP. Please try again.")
      return
    }

    // Probe BEFORE collecting the name so an existing customer doesn't
    // waste a step filling out something we don't need from them.
    try {
      const authResult = await verifyFirebasePhone({
        id_token: result.idToken,
        role: "customer",
        lookup_only: true,
      })
      setAuthUser(authResult.user, authResult.access_token)
      toast.success("Welcome back!")
      router.replace(redirectTo)
      return
    } catch (err) {
      if (isPhoneNotRegisteredError(err)) {
        setIdToken(result.idToken)
        setIdTokenIssuedAt(Date.now())
        toast.success("Phone verified!")
        setStep(2)
        return
      }
      if (isRoleMismatchError(err)) {
        toast.error("This number is registered with a different Kshuri account.")
        return
      }
      toast.error(extractErrorMessage(err, "Couldn't verify your account. Please try again."))
    }
  }

  async function handleCreateAccount() {
    if (!idToken) {
      toast.error("Please verify your phone again.")
      setStep(1)
      return
    }
    const trimmed = fullName.trim()
    if (!trimmed) {
      toast.error("Please tell us your name")
      return
    }
    if (Date.now() - idTokenIssuedAt > HANDOFF_TTL_MS) {
      toast.error("Your verification expired. Please re-verify your phone.")
      setStep(1)
      setIdToken("")
      reset()
      return
    }

    const parts = trimmed.split(/\s+/)
    const firstName = parts[0] ?? ""
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : ""

    setIsSubmitting(true)
    try {
      const authResult = await verifyFirebasePhone({
        id_token: idToken,
        role: "customer",
        is_signup: true,
        first_name: firstName,
        last_name: lastName,
      })
      setAuthUser(authResult.user, authResult.access_token)
      toast.success("Welcome to Kshuri!")
      // New signups land on the optional address step so the booking flow
      // can offer home-service later without re-prompting. The page honors
      // `redirect` so any /book/* deep-link still resolves after.
      const addressUrl = `/signup/address${redirectTo && redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`
      router.replace(addressUrl)
    } catch (err) {
      if (isPhoneAlreadyExistsError(err)) {
        // Race: account created in another tab between our probe and submit.
        // Re-issue as a probe and use the response.
        try {
          const authResult = await verifyFirebasePhone({
            id_token: idToken,
            role: "customer",
            lookup_only: true,
          })
          setAuthUser(authResult.user, authResult.access_token)
          toast.success("Welcome back!")
          router.replace(redirectTo)
          return
        } catch {
          toast.error("This phone is already registered. Please sign in.")
          router.push("/login")
          return
        }
      }
      toast.error(extractErrorMessage(err, "Couldn't create your account."))
    } finally {
      setIsSubmitting(false)
    }
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
            Join Kshuri
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            Discover and book India&apos;s best grooming professionals in seconds.
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

          <h2 className="text-[28px] font-serif font-bold text-foreground tracking-tight mb-1">
            Create Account
          </h2>

          <StepIndicator current={step} total={TOTAL_STEPS} />

          {step === 1 && (
            <div className="space-y-5">
              <div id="signup-recaptcha-container" />
              {!otpSent ? (
                <>
                  <PhoneInput value={phone} onChange={setPhone} autoFocus />
                  <Button
                    disabled={isPhoneAuthLoading || !phoneValid}
                    className="w-full h-12 gap-2 font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleSendOtp}
                  >
                    {isPhoneAuthLoading ? "Sending…" : "Send OTP"} <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
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
                    disabled={isPhoneAuthLoading || otpCode.length !== 6}
                    className="w-full h-12 gap-2 font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleVerifyOtp}
                  >
                    {isPhoneAuthLoading ? "Verifying…" : "Verify Phone"} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        reset()
                        setOtpCode("")
                      }}
                      className="text-xs text-accent hover:underline font-medium"
                    >
                      Use a different number
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                This is the name vendors will see on your bookings.
              </p>
              <div>
                <label className="text-[13px] font-semibold text-foreground mb-2.5 block">
                  Full Name <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    placeholder="Priya Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoFocus
                    maxLength={100}
                    className="pl-10 h-12 rounded-xl bg-muted/30 border-border/50"
                  />
                </div>
              </div>
              <Button
                disabled={isSubmitting || fullName.trim().length === 0}
                className="w-full h-12 gap-2 font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCreateAccount}
              >
                {isSubmitting ? "Creating…" : "Create Account"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link
              href={`/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
              className="font-semibold hover:underline text-accent"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  )
}
