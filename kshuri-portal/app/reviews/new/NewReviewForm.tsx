'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ReviewPhotoUploader } from '@/components/discovery/ReviewPhotoUploader';
import { useCreateReview } from '@kshuri/api-client';

interface NewReviewFormProps {
  targetKind: 'vendor' | 'service_line' | 'product';
  targetId: string;
}

interface Photo {
  url: string;
  w: number;
  h: number;
}

// Placeholder upload adapter — in R1 we store the file as a data URL so the
// review submission flow is fully exercisable even before media-upload wiring.
// Phase 9 swaps this for mediaService.uploadMedia(blob).
async function localUploadAdapter(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function NewReviewForm({ targetKind, targetId }: NewReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);

  const mutation = useCreateReview();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      {
        target_kind: targetKind,
        target_id: targetId,
        rating,
        title: title || undefined,
        comment: comment || undefined,
        photos: photos.length > 0 ? photos : undefined,
      },
      {
        onSuccess: () => {
          // Navigate back to whichever page is most useful; vendor/service show their own page.
          if (targetKind === 'vendor') router.push(`/vendors`);
          else router.push('/');
        },
      },
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="space-y-2">
        <Label>Rating</Label>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              onClick={() => setRating(n)}
              className="rounded-md p-1 hover:bg-muted"
            >
              <Star
                className={`h-7 w-7 ${n <= rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`}
                aria-hidden
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="A short headline for your review"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Your review (optional)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          rows={5}
          placeholder="What did you love or not love?"
        />
        <p className="text-xs text-muted-foreground">{comment.length} / 2000</p>
      </div>

      <div className="space-y-2">
        <Label>Photos (optional, up to 5)</Label>
        <ReviewPhotoUploader
          value={photos}
          onChange={setPhotos}
          uploadAdapter={(blob) => localUploadAdapter(blob)}
        />
      </div>

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          Could not submit your review. Please try again.
        </p>
      )}
      {mutation.isSuccess && (
        <p role="status" className="text-sm text-emerald-700">
          Review submitted — thanks!
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Submitting…' : 'Submit review'}
        </Button>
      </div>
    </form>
  );
}
