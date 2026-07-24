'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { rateLimit } from '@/lib/rate-limit';

// ============================================================================
// SECURITY: Next.js Server Action — Contact Lead Submission
//
// Security measures applied:
//   1. IP-based rate limiting (5 submissions per 60 seconds)
//   2. Zod schema validation with strict types
//   3. Input sanitization (trim + max-length guards)
//   4. Safe error logging (no PII exposed in server logs)
//   5. Generic error messages to prevent enumeration attacks
// ============================================================================

const ContactSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .trim(),
  email_address: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long')
    .trim()
    .toLowerCase(),
  inquiry_type: z.enum(['partnership', 'support', 'general']),
  message_body: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long (max 2000 characters)')
    .trim(),
});

export type ContactActionState = {
  errors?: Partial<Record<string, string[]>>;
  message?: string;
  success?: boolean;
};

export async function submitContactLead(
  prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  // ── 1. Rate Limiting ──────────────────────────────────────────────────────
  const headersList = await headers();
  // Prefer the real IP from reverse proxy headers
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'anonymous';

  const { success: withinLimit } = rateLimit(ip, 5, 60_000);
  if (!withinLimit) {
    return {
      message: 'Too many requests. Please wait a moment and try again.',
    };
  }

  // ── 2. Input Validation ───────────────────────────────────────────────────
  const raw = {
    first_name: formData.get('first_name'),
    email_address: formData.get('email_address'),
    inquiry_type: formData.get('inquiry_type'),
    message_body: formData.get('message_body'),
  };

  const validated = ContactSchema.safeParse(raw);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Please fix the errors above and try again.',
    };
  }

  // ── 3. Backend submit ─────────────────────────────────────────────────────
  // Backend's enum is {partnership, support, feedback, press, other} — map
  // our user-facing 'general' option to the closest backend value.
  const backendInquiryType =
    validated.data.inquiry_type === 'general' ? 'other' : validated.data.inquiry_type;

  try {
    await apiClient.post('/cms/contact', {
      first_name: validated.data.first_name,
      email_address: validated.data.email_address,
      inquiry_type: backendInquiryType,
      message_body: validated.data.message_body,
    });
  } catch (err) {
    // Log the error code only — never log user input (PII).
    const code = (err as { response?: { data?: { error?: { code?: string } } } })
      ?.response?.data?.error?.code;
    console.error('[contact-action] backend error code:', code ?? 'unknown');
    return {
      message: 'Something went wrong. Please try again later.',
    };
  }

  return {
    message: 'Thank you! We will get back to you within 24 hours.',
    success: true,
  };
}

