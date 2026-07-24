'use client'

import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  className?: string
  /** Render N cards. Defaults to 1. */
  count?: number
}

export function SkeletonCard({ className, count = 1 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded-2xl border border-border bg-card overflow-hidden',
            className,
          )}
        >
          <div className="aspect-[4/3] bg-muted" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="flex gap-2 pt-2">
              <div className="h-3 bg-muted rounded w-16" />
              <div className="h-3 bg-muted rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
