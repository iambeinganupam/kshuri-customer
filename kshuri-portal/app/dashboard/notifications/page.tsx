'use client'

import { Bell, Check } from 'lucide-react'
import { toast } from 'sonner'
import {
  useNotificationList,
  useMarkRead,
  type NotificationDto,
} from '@kshuri/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/empty-state'
import { SkeletonCard } from '@/components/skeleton-card'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion-wrapper'
import { cn } from '@/lib/utils'

export default function NotificationsPage() {
  const q = useNotificationList()
  const markRead = useMarkRead()

  const notifications: NotificationDto[] = q.data?.data ?? []

  function handleMarkAll() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length === 0) return
    markRead.mutate(
      { ids: unreadIds },
      {
        onSuccess: () => toast.success('All marked as read.'),
        onError: () => toast.error('Could not mark all — please try again.'),
      },
    )
  }

  function handleMarkOne(id: string) {
    markRead.mutate(
      { ids: [id] },
      {
        onError: () => toast.error('Could not mark as read — please try again.'),
      },
    )
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Notifications</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Booking updates, replies, and platform announcements.
            </p>
          </div>
          {notifications.some((n) => !n.is_read) && (
            <Button variant="outline" size="sm" onClick={handleMarkAll}>
              <Check className="mr-1 h-4 w-4" /> Mark all read
            </Button>
          )}
        </div>
      </FadeIn>

      {q.isLoading ? (
        <div className="grid gap-3">
          <SkeletonCard count={3} />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-6 w-6" />}
          title="No notifications yet"
          description="When you book, message, or get a reply, you'll see updates here."
        />
      ) : (
        <StaggerContainer staggerDelay={0.04} className="grid gap-2">
          {notifications.map((n) => (
            <StaggerItem key={n.id}>
              <Card
                className={cn(
                  'border-border/60 transition-colors',
                  !n.is_read && 'border-primary/40 bg-primary/5',
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{n.title}</h3>
                      {n.body && (
                        <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                      )}
                      <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground/70">
                        {new Date(n.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkOne(n.id)}
                        className="shrink-0 text-xs"
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  )
}
