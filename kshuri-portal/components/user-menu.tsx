"use client"

// ─────────────────────────────────────────────────────────────────────────────
// UserMenu — auth-state-aware nav slot.
//
// Three states, one component:
//   1. isLoading   → 36px skeleton pill (avoids layout shift on cold refresh)
//   2. anonymous   → "Sign in" outlined button (links to /login with
//                    ?redirect=current-path so users land where they were)
//   3. signed-in   → Avatar button + dropdown (My bookings, Wishlist, Sign out)
//
// Composes on top of the shared <DropdownMenu> primitive so styling stays
// consistent with the rest of the portal's UI surface (vendor card menus,
// service detail sheets, etc.).
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Calendar, Heart, LogOut, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth/auth-context"

function initialsFor(firstName: string, lastName: string): string {
  const f = firstName?.trim().charAt(0).toUpperCase() ?? ""
  const l = lastName?.trim().charAt(0).toUpperCase() ?? ""
  return (f + l) || "?"
}

function fullName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "Your account"
}

export function UserMenu() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  if (isLoading) {
    // Skeleton — matches the 36×36 avatar circle so the navbar's CTA cluster
    // doesn't reflow when auth state resolves.
    return (
      <div
        className="h-9 w-9 rounded-full bg-muted/60 animate-pulse"
        aria-hidden="true"
      />
    )
  }

  if (!isAuthenticated || !user) {
    const loginHref =
      pathname && pathname !== "/" && pathname !== "/login"
        ? `/login?redirect=${encodeURIComponent(pathname)}`
        : "/login"
    return (
      <Link href={loginHref}>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-full px-4 text-sm font-medium"
        >
          <User className="mr-1.5 h-4 w-4" />
          Sign in
        </Button>
      </Link>
    )
  }

  const name = fullName(user.first_name, user.last_name)
  const initials = initialsFor(user.first_name, user.last_name)
  const subtitle = user.phone_number ?? user.email ?? ""

  async function handleLogout() {
    await logout()
    router.push("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${name}`}
          className="rounded-full ring-offset-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="h-9 w-9 border border-border/60">
            {user.avatar_url ? <AvatarImage src={user.avatar_url} alt={name} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold leading-tight">{name}</span>
          {subtitle ? (
            <span className="text-xs font-normal text-muted-foreground">
              {subtitle}
            </span>
          ) : null}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            My dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/bookings" className="flex items-center gap-2 cursor-pointer">
            <Calendar className="h-4 w-4" />
            My bookings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/wishlist" className="flex items-center gap-2 cursor-pointer">
            <Heart className="h-4 w-4" />
            Wishlist
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={handleLogout}
          className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
