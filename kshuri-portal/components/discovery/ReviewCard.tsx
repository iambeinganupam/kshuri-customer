'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Flag, MoreHorizontal, Star, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReviewPhoto {
  url: string;
  w?: number | null;
  h?: number | null;
}

interface Review {
  id: string;
  author_name?: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  photos?: ReviewPhoto[];
  helpful_count?: number;
  vendor_reply?: string | null;
  created_at: string;
}

interface ReviewCardProps {
  review: Review;
  onHelpful: (id: string) => void;
  onReport: (id: string) => void;
  isOwn: boolean;
}

const COMMENT_TRUNCATE = 240;

function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  const diffWk = Math.floor(diffDay / 7);
  if (diffWk < 5) return `${diffWk} week${diffWk === 1 ? '' : 's'} ago`;
  const diffMo = Math.floor(diffDay / 30);
  if (diffMo < 12) return `${diffMo} month${diffMo === 1 ? '' : 's'} ago`;
  const diffYr = Math.floor(diffDay / 365);
  return `${diffYr} year${diffYr === 1 ? '' : 's'} ago`;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function ReviewCard({ review, onHelpful, onReport, isOwn }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState<ReviewPhoto | null>(null);

  const author = review.author_name?.trim() || 'Verified customer';
  const comment = review.comment ?? '';
  const isLong = comment.length > COMMENT_TRUNCATE;
  const shown = !isLong || expanded ? comment : comment.slice(0, COMMENT_TRUNCATE) + '…';
  const photos = review.photos ?? [];
  const helpfulCount = review.helpful_count ?? 0;

  return (
    <article className="rounded-lg border bg-card p-4 text-card-foreground">
      <header className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{author}</span>
            <span className="text-xs text-muted-foreground">{relativeDate(review.created_at)}</span>
          </div>
          <Stars rating={review.rating} />
        </div>
        {!isOwn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Review actions">
                <MoreHorizontal className="h-4 w-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onReport(review.id)}>
                <Flag className="h-4 w-4" aria-hidden />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      {review.title && <h3 className="mt-2 font-semibold">{review.title}</h3>}

      {comment && (
        <div className="mt-1 text-sm text-foreground">
          <p className="whitespace-pre-wrap">{shown}</p>
          {isLong && (
            <button
              type="button"
              className="mt-1 text-sm font-medium text-primary hover:underline"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {photos.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {photos.map((p, idx) => (
            <button
              key={`${p.url}-${idx}`}
              type="button"
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted"
              onClick={() => setLightbox(p)}
              aria-label="Open review photo"
            >
              <Image
                src={p.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

      {review.vendor_reply && (
        <div className="mt-3 rounded-md border-l-2 border-primary bg-muted/40 px-3 py-2">
          <div className="text-xs font-medium text-muted-foreground">Vendor reply</div>
          <p className="mt-0.5 text-sm">{review.vendor_reply}</p>
        </div>
      )}

      <footer className="mt-3 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => onHelpful(review.id)}
        >
          <ThumbsUp className="h-4 w-4" aria-hidden />
          Helpful ({helpfulCount})
        </Button>
      </footer>

      <Dialog open={lightbox !== null} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Review photo</DialogTitle>
            <DialogDescription className="sr-only">Enlarged review photo</DialogDescription>
          </DialogHeader>
          {lightbox && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
              <Image
                src={lightbox.url}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </article>
  );
}
