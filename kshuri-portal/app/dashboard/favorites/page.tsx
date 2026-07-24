'use client'

import Link from 'next/link'
import { Heart, Star, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  useFavorites,
  useRemoveFavorite,
  type Favorite,
} from '@kshuri/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/empty-state'
import { SkeletonCard } from '@/components/skeleton-card'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion-wrapper'

export default function FavoritesPage() {
  const q = useFavorites()
  const remove = useRemoveFavorite()

  function handleRemove(fav: Favorite) {
    // useRemoveFavorite takes the vendor_id string directly
    remove.mutate(fav.vendor_id, {
      onSuccess: () => toast.success('Removed from favorites.'),
      onError:   () => toast.error('Could not remove — please try again.'),
    })
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="text-xl font-semibold">Saved vendors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap the heart on any vendor card to save them here for later.
        </p>
      </FadeIn>

      {q.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard count={6} />
        </div>
      ) : (q.data ?? []).length === 0 ? (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="No favorites yet"
          description="Save the vendors you love so you can find them again in one tap."
          ctaLabel="Browse vendors"
          ctaHref="/vendors"
        />
      ) : (
        <StaggerContainer
          staggerDelay={0.05}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {q.data!.map((fav) => (
            <StaggerItem key={fav.id}>
              <Card className="group relative border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      {fav.logo_url && (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={fav.logo_url}
                            alt={fav.vendor_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold">{fav.vendor_name}</h3>
                        <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                          {fav.vendor_type === 'salon_location' ? 'Salon' : 'Freelancer'}
                        </p>
                        {fav.avg_rating != null && fav.avg_rating > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                            <Star className="h-3 w-3 fill-current" />
                            <span>{fav.avg_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-rose-600"
                      onClick={() => handleRemove(fav)}
                      aria-label="Remove from favorites"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={fav.url_slug ? `/vendors/${fav.url_slug}` : '/vendors'}>
                        View vendor
                      </Link>
                    </Button>
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
