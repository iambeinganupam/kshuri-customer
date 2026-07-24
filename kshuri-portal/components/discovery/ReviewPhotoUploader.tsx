'use client';

import { useCallback, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReviewPhoto {
  url: string;
  w: number;
  h: number;
}

interface ReviewPhotoUploaderProps {
  value: ReviewPhoto[];
  onChange: (next: ReviewPhoto[]) => void;
  /** Inject the upload adapter for testability. Called once per dropped file
   *  with the resized blob. Must resolve to a URL string. */
  uploadAdapter: (blob: Blob, w: number, h: number) => Promise<string>;
  maxPhotos?: number;
  maxEdgePx?: number;
}

async function resize(
  file: File,
  maxEdge: number,
): Promise<{ blob: Blob; w: number; h: number } | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close?.();
      return null;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
    return { blob, w, h };
  } catch {
    return null;
  }
}

export function ReviewPhotoUploader({
  value,
  onChange,
  uploadAdapter,
  maxPhotos = 5,
  maxEdgePx = 1600,
}: ReviewPhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remaining = Math.max(0, maxPhotos - value.length);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .slice(0, remaining);
      if (list.length === 0) return;
      setBusy(true);
      const uploads: ReviewPhoto[] = [];
      for (const file of list) {
        const r = await resize(file, maxEdgePx);
        if (!r) continue;
        try {
          const url = await uploadAdapter(r.blob, r.w, r.h);
          uploads.push({ url, w: r.w, h: r.h });
        } catch {
          /* silently drop on upload failure in R1 */
        }
      }
      setBusy(false);
      if (uploads.length > 0) onChange([...value, ...uploads]);
    },
    [remaining, maxEdgePx, uploadAdapter, value, onChange],
  );

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) void handleFiles(e.dataTransfer.files);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = () => setIsDragging(false);

  const removeAt = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  return (
    <div
      data-testid="review-photo-dropzone"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`space-y-2 rounded-lg border-2 border-dashed p-3 transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
      }`}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {value.length} / {maxPhotos}
        </span>
        {busy && <span className="text-muted-foreground">Uploading…</span>}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {value.map((p, i) => (
          <div key={p.url + i} className="relative aspect-square overflow-hidden rounded-md border">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary upload URLs are not allowlisted in next.config; use plain img */}
            <img src={p.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < maxPhotos ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-square h-auto flex-col items-center justify-center rounded-md border border-dashed text-muted-foreground"
          >
            <Camera className="h-5 w-5" aria-hidden />
            <span className="mt-1 text-xs">Add photo</span>
          </Button>
        ) : (
          <div className="col-span-full text-center text-xs text-muted-foreground">
            Maximum reached
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
