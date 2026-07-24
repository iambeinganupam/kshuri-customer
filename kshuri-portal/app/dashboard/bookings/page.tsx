'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  useAppointments,
  useAppointmentAction,
  type Appointment,
} from '@kshuri/api-client'
import { BookingCard } from '@/components/dashboard/booking-card'
import { RescheduleDialog } from '@/components/dashboard/reschedule-dialog'
import { EmptyState } from '@/components/empty-state'
import { SkeletonCard } from '@/components/skeleton-card'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion-wrapper'
import { cn } from '@/lib/utils'
import {
  UPCOMING_APPOINTMENT_STATUSES as UPCOMING_STATUSES,
  PAST_APPOINTMENT_STATUSES as PAST_STATUSES,
} from '@/lib/content/dashboard'

type Bucket = 'upcoming' | 'past'

export default function BookingsPage() {
  const [bucket, setBucket] = useState<Bucket>('upcoming')
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null)

  // Fetch the 50 most recent appointments; filter client-side so the
  // Upcoming/Past toggle is instant. Customers with >50 active appointments
  // are rare; cursor pagination can be added later if needed.
  const q = useAppointments({ limit: 50 })

  const all: Appointment[] = q.data?.items ?? []
  const upcoming = all.filter((a) =>
    UPCOMING_STATUSES.includes(a.status as typeof UPCOMING_STATUSES[number]),
  )
  const past = all.filter((a) =>
    PAST_STATUSES.includes(a.status as typeof PAST_STATUSES[number]),
  )
  const visible = bucket === 'upcoming' ? upcoming : past

  const action = useAppointmentAction()

  function handleCancel(appointmentId: string) {
    if (!confirm('Cancel this booking? This cannot be undone.')) return
    action.mutate(
      { appointmentId, action: 'cancel' },
      {
        onSuccess: () => toast.success('Booking cancelled.'),
        onError:   () => toast.error('Could not cancel — please try again.'),
      },
    )
  }


  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">My bookings</h1>
        </div>
        <div className="mt-3 flex gap-1 rounded-full border border-border/60 bg-card p-1 sm:w-fit">
          <BucketButton
            active={bucket === 'upcoming'}
            onClick={() => setBucket('upcoming')}
            count={upcoming.length}
          >
            Upcoming
          </BucketButton>
          <BucketButton
            active={bucket === 'past'}
            onClick={() => setBucket('past')}
            count={past.length}
          >
            Past
          </BucketButton>
        </div>
      </FadeIn>

      {q.isLoading ? (
        <div className="grid gap-3">
          <SkeletonCard count={3} />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title={bucket === 'upcoming' ? 'No upcoming bookings' : 'No past bookings yet'}
          description={
            bucket === 'upcoming'
              ? 'Browse vendors and book your next session — it will show up here.'
              : 'Once you complete (or cancel) a booking, it will appear here for reference.'
          }
          ctaLabel={bucket === 'upcoming' ? 'Browse vendors' : undefined}
          ctaHref={bucket === 'upcoming' ? '/vendors' : undefined}
        />
      ) : (
        <StaggerContainer staggerDelay={0.05} className="grid gap-3">
          {visible.map((appt) => (
            <StaggerItem key={appt.id}>
              <BookingCard
                appointment={appt}
                showActions={bucket === 'upcoming'}
                onCancel={() => handleCancel(appt.id)}
                onReschedule={() => setRescheduleTarget(appt)}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {rescheduleTarget && (
        <RescheduleDialog
          open={!!rescheduleTarget}
          onOpenChange={(open) => { if (!open) setRescheduleTarget(null) }}
          appointment={rescheduleTarget}
        />
      )}
    </div>
  )
}

function BucketButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted',
      )}
    >
      <span>{children}</span>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-[10px] font-semibold',
          active ? 'bg-primary-foreground/20' : 'bg-muted',
        )}
      >
        {count}
      </span>
    </button>
  )
}
