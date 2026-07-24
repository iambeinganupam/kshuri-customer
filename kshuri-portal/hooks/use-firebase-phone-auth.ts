"use client"

// ─────────────────────────────────────────────────────────────────────────────
// useFirebasePhoneAuth — @kshuri/portal
// ─────────────────────────────────────────────────────────────────────────────
// Encapsulates the RecaptchaVerifier lifecycle, signInWithPhoneNumber, and
// confirmationResult.confirm() so Login and Signup pages stay declarative.
// Same contract as the salon + freelancer + customer-dashboard copies.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react"
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

interface UseFirebasePhoneAuthProps {
  containerId: string
}

export function useFirebasePhoneAuth({ containerId }: UseFirebasePhoneAuthProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null)
  const [otpSent, setOtpSent] = useState(false)

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = undefined
      }
    }
  }, [])

  const sendOtp = useCallback(
    async (phoneNumber: string) => {
      setIsLoading(true)
      setError(null)
      try {
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear()
          } catch (e) {
            // ignore
          }
          window.recaptchaVerifier = undefined
        }
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: "invisible",
        })
        const result = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          window.recaptchaVerifier,
        )
        setConfirmationResult(result)
        setOtpSent(true)
        return { success: true as const }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to send OTP. Please try again."
        // eslint-disable-next-line no-console
        console.error("Firebase Phone Auth Error:", err)
        setError(message)
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear()
          window.recaptchaVerifier = undefined
        }
        return { success: false as const, error: err }
      } finally {
        setIsLoading(false)
      }
    },
    [containerId],
  )

  const verifyOtp = useCallback(
    async (otpCode: string) => {
      if (!confirmationResult) {
        const msg = "No OTP request found. Please request a new OTP."
        setError(msg)
        return { success: false as const, error: new Error(msg) }
      }
      setIsLoading(true)
      setError(null)
      try {
        const result = await confirmationResult.confirm(otpCode)
        const idToken = await result.user.getIdToken()
        return { success: true as const, idToken }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Invalid OTP or verification failed."
        // eslint-disable-next-line no-console
        console.error("Firebase OTP Verification Error:", err)
        setError(message)
        return { success: false as const, error: err }
      } finally {
        setIsLoading(false)
      }
    },
    [confirmationResult],
  )

  const reset = useCallback(() => {
    setOtpSent(false)
    setConfirmationResult(null)
    setError(null)
  }, [])

  return {
    sendOtp,
    verifyOtp,
    reset,
    otpSent,
    isLoading,
    error,
  }
}
