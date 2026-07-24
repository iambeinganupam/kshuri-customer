"use client"

import Link from "next/link"
import { useGroomingCategories } from "@/lib/content/categories"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper"

const quickLinks = [
  { label: "Home",       href: "/" },
  { label: "All Services", href: "/services" },
  { label: "Find Vendors", href: "/vendors" },
  { label: "Contact Us",  href: "/contact" },
  { label: "For Vendors →", href: "/vendor-portal" },
]

export function Footer() {
  const { categories } = useGroomingCategories()
  return (
    <div className="hidden md:block">
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <FadeIn direction="up" duration={0.6}>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <span className="font-serif text-lg font-bold text-primary-foreground">K</span>
                </div>
                <span className="font-serif text-xl font-bold">Kshuri</span>
              </Link>
              <p className="text-sm leading-relaxed opacity-70">
                India&apos;s daily grooming marketplace connecting people with trusted hair, makeup, spa, and barber professionals.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-3">
              <h3 className="font-serif text-base font-semibold">Quick Links</h3>
              <div className="flex flex-col gap-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm opacity-70 transition-opacity hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Service Categories */}
            <div className="flex flex-col gap-3">
              <h3 className="font-serif text-base font-semibold">Services</h3>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/services/${cat.slug}`}
                    className="text-sm opacity-70 transition-opacity hover:opacity-100"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-3">
              <h3 className="font-serif text-base font-semibold">Contact</h3>
              <div className="flex flex-col gap-2 text-sm opacity-70">
                <p>hello@kshuri.in</p>
                <p>+91 98765 43210</p>
                <p>New Delhi, India</p>
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-background/20 pt-8 sm:flex-row sm:justify-between">
          <p className="text-sm opacity-60">
            Made with love for everyday grooming
          </p>
          <p className="text-sm opacity-60">
            &copy; {new Date().getFullYear()} Kshuri. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
    </div>
  )
}
