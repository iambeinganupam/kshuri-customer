"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, LayoutDashboard, MessageSquare, HelpCircle, ExternalLink, BarChart3, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const vendorNavLinks = [
  { label: "Overview",   href: "/vendor-portal",            icon: BarChart3 },
  { label: "Dashboard",  href: "/vendor-portal/dashboard",  icon: LayoutDashboard },
  { label: "Inquiries",  href: "/vendor-portal/dashboard",  icon: MessageSquare },
  { label: "Help",       href: "/contact",                  icon: HelpCircle },
]

export function VendorNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Top accent stripe */}
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-gold to-primary" />

      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#1a1010]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1a1010]/80">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">

          {/* Logo */}
          <Link href="/vendor-portal" className="flex items-center gap-2.5">
            <motion.div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <span className="font-serif text-lg font-bold text-primary-foreground">K</span>
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-base font-bold text-white">Kshuri</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gold/80">Partners</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 md:flex">
            {vendorNavLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white"
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-medium text-white/40 transition-colors hover:text-white/70"
            >
              <ExternalLink className="h-3 w-3" />
              Go to Customer Site
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="sm"
                className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
              >
                My Account
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-[#1a1010] border-white/10">
                <SheetHeader>
                  <SheetTitle className="font-serif text-lg text-white">
                    Kshuri <span className="text-gold text-xs font-semibold uppercase tracking-widest">Partners</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-1">
                  {vendorNavLinks.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.1 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                  <div className="my-3 h-px bg-white/10" />
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-white/40 hover:text-white/70"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Go to Customer Site
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </nav>
      </header>
    </>
  )
}
