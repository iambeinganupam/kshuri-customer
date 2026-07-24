'use client'

import { Calendar, Heart, MapPin } from 'lucide-react'
import { useDashboardOverview, getGreetingName } from '@/lib/content/dashboard'
import { FadeIn } from '@/components/motion-wrapper'

interface StatProps {
  icon: typeof Calendar
  value: number | string
  label: string
  loading?: boolean
}

function Stat({ icon: Icon, value, label, loading }: StatProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-lg font-semibold leading-none">
          {loading ? '—' : value}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

export function DashboardHeader() {
  const { profile, upcoming, favorites } = useDashboardOverview()
  const name = getGreetingName(profile.data ?? null)

  // useAppointments returns PaginatedResult<Appointment> = { items: Appointment[], has_more: boolean }
  const upcomingCount = upcoming.data?.items?.length ?? 0

  return (
    <section className="border-b border-border/60 bg-gradient-to-br from-primary/5 to-gold/5 px-4 py-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
            Welcome back, {name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your bookings, favorites, profile, and addresses in one place.
          </p>
        </FadeIn>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <Stat
            icon={Calendar}
            value={upcomingCount}
            label="Upcoming bookings"
            loading={upcoming.isLoading}
          />
          <Stat
            icon={Heart}
            value={favorites.data?.length ?? 0}
            label="Saved vendors"
            loading={favorites.isLoading}
          />
          <Stat
            icon={MapPin}
            value={profile.data?.id ? 'Active' : '—'}
            label="Account status"
            loading={profile.isLoading}
          />
        </div>
      </div>
    </section>
  )
}
