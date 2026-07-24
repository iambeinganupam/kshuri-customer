import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kshuri Partners — Grow your grooming business",
  description:
    "Join India's leading grooming marketplace. Reach customers booking weekly haircuts, makeup, spa, and salon services — and grow your business with Kshuri Partners.",
}

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
