'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Heart, User, MapPin, Bell, Receipt } from 'lucide-react'
import { useUnreadCount } from '@kshuri/api-client'
import { cn } from '@/lib/utils'
import { CUSTOMER_BOOKING_FLOW_ENABLED } from '@/lib/feature-flags'

const ALL_TABS = [
  { href: '/dashboard',              label: 'Overview',       icon: LayoutDashboard, showBadge: false, flag: 'always' },
  { href: '/dashboard/bookings',     label: 'Bookings',       icon: Calendar,        showBadge: false, flag: 'always' },
  { href: '/dashboard/transactions', label: 'Transactions',   icon: Receipt,         showBadge: false, flag: 'booking' },
  { href: '/dashboard/favorites',    label: 'Favorites',      icon: Heart,           showBadge: false, flag: 'always' },
  { href: '/dashboard/notifications',label: 'Notifications',  icon: Bell,            showBadge: true,  flag: 'always' },
  { href: '/dashboard/profile',      label: 'Profile',        icon: User,            showBadge: false, flag: 'always' },
  { href: '/dashboard/addresses',    label: 'Addresses',      icon: MapPin,          showBadge: false, flag: 'always' },
] as const

const TABS = ALL_TABS.filter((t) => {
  if (t.flag === 'booking') return CUSTOMER_BOOKING_FLOW_ENABLED
  return true
})

export function DashboardTabs() {
  const pathname = usePathname()
  const unread = useUnreadCount()
  // useUnreadCount service unwraps the response and returns number directly
  const unreadCount = typeof unread.data === 'number' ? unread.data : 0

  return (
    <nav className="border-b border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 lg:gap-2">
        {TABS.map(({ href, label, icon: Icon, showBadge }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {showBadge && unreadCount > 0 && (
                <span
                  className={cn(
                    'ml-1 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    isActive
                      ? 'bg-primary-foreground/20'
                      : 'bg-primary text-primary-foreground',
                  )}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
