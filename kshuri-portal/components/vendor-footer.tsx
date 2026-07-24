"use client"

import Link from "next/link"

const footerLinks = [
  { label: "Partner Overview", href: "/vendor-portal" },
  { label: "Vendor Dashboard", href: "/vendor-portal/dashboard" },
  { label: "Help & Support",   href: "/contact" },
  { label: "Contact Us",       href: "/contact" },
]

const legalLinks = [
  { label: "Terms for Vendors", href: "/contact" },
  { label: "Privacy Policy",    href: "/contact" },
]

export function VendorFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#110a0a]">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/vendor-portal" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="font-serif text-base font-bold text-primary-foreground">K</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-sm font-bold text-white">Kshuri</span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-gold/70">Partners</span>
              </div>
            </Link>
            <p className="max-w-xs text-xs leading-relaxed text-white/40">
              India&apos;s trusted platform for grooming professionals to grow their business and connect with customers across the country.
            </p>
            <Link
              href="/"
              className="mt-1 inline-flex w-fit items-center gap-1 rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-white/50 transition-colors hover:border-white/20 hover:text-white/70"
            >
              ← Back to Customer Site
            </Link>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30">Partner Portal</h3>
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-white/50 transition-colors hover:text-white/80"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30">Legal</h3>
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-white/50 transition-colors hover:text-white/80"
              >
                {link.label}
              </Link>
            ))}
          </div>

        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Kshuri Partners. All rights reserved.
          </p>
          <p className="text-xs text-white/20">
            Built for grooming professionals
          </p>
        </div>
      </div>
    </footer>
  )
}
