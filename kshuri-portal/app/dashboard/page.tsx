'use client'

import Link from 'next/link'
import { ArrowRight, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDashboardOverview } from '@/lib/content/dashboard'
import { BookingCard } from '@/components/dashboard/booking-card'
import { EmptyState } from '@/components/empty-state'
import { SkeletonCard } from '@/components/skeleton-card'
import { FadeIn } from '@/components/motion-wrapper'

export default function DashboardOverviewPage() {
  const { upcoming, favorites } = useDashboardOverview()

  const nextAppt = upcoming.data?.items?.[0]
  const topFavorites = (favorites.data ?? []).slice(0, 4)

  return (
    <div className="space-y-8">
      {/* Next appointment */}
      <FadeIn>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Next appointment</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/bookings">
                All bookings <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {upcoming.isLoading ? (
            <SkeletonCard count={1} />
          ) : nextAppt ? (
            <BookingCard appointment={nextAppt} detailHref="/dashboard/bookings" />
          ) : (
            <EmptyState
              title="No upcoming bookings"
              description="Browse vendors and book your next session."
              ctaLabel="Browse vendors"
              ctaHref="/vendors"
            />
          )}
        </section>
      </FadeIn>

      {/* Saved favorites preview */}
      <FadeIn>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Saved vendors</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/favorites">
                See all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {favorites.isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SkeletonCard count={4} />
            </div>
          ) : topFavorites.length === 0 ? (
            <EmptyState
              icon={<Heart className="h-6 w-6" />}
              title="No favorites yet"
              description="Save vendors you love by tapping the heart on their card."
              ctaLabel="Browse vendors"
              ctaHref="/vendors"
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topFavorites.map((f) => (
                <Card key={f.id} className="border-border/60">
                  <CardContent className="p-4">
                    <h3 className="truncate font-semibold text-foreground">{f.vendor_name}</h3>
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                      {f.vendor_type === 'salon_location' ? 'Salon' : 'Freelancer'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </FadeIn>

      {/* Quick actions */}
      <FadeIn>
        <section className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="text-lg font-semibold">Quick actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Hop into the most common tasks.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/vendors">Browse vendors</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/addresses">Manage addresses</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/profile">Edit profile</Link>
            </Button>
          </div>
        </section>
      </FadeIn>
    </div>
  )
}
