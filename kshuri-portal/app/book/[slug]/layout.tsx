// ─────────────────────────────────────────────────────────────────────────────
// /book/[slug]/layout — flag gate + chrome
// ─────────────────────────────────────────────────────────────────────────────
// The booking flow is gated behind CUSTOMER_BOOKING_FLOW_ENABLED. When the
// flag is off we 404 at the route layer so step pages never render.
//
// Auth is already enforced at the edge by proxy.ts (cookie presence on
// /book/*), so the layout itself can stay anonymous; the BookingShell
// (client) loads the vendor + draft when mounted.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CUSTOMER_BOOKING_FLOW_ENABLED } from '@/lib/feature-flags'
import { BookingShell } from './_components/BookingShell'

interface LayoutProps {
  children: ReactNode
  params: Promise<{ slug: string }>
}

export default async function BookLayout({ children, params }: LayoutProps) {
  if (!CUSTOMER_BOOKING_FLOW_ENABLED) notFound()

  const { slug } = await params

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <BookingShell slug={slug}>{children}</BookingShell>
      </main>
      <Footer />
    </div>
  )
}
