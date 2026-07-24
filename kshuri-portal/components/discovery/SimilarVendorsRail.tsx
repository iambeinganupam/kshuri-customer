import Link from 'next/link';
import { Star } from 'lucide-react';

interface SimilarVendor {
  id: string;
  slug: string | null;
  name: string;
  type: 'freelancer' | 'salon_location';
  ratingAvg: number;
  ratingCount: number;
}

interface SimilarVendorsRailProps {
  // Pre-resolved mini-card data; fetching is the page's responsibility (avoids N+1).
  vendors: SimilarVendor[];
  title?: string;
}

function Tile({ v }: { v: SimilarVendor }) {
  const body = (
    <div className="min-w-[200px] snap-start space-y-2 rounded-lg border bg-card p-3 hover:bg-muted/40">
      <h3 className="font-semibold leading-tight">{v.name}</h3>
      <div className="flex items-center gap-1 text-sm">
        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden />
        <span className="tabular-nums">{v.ratingAvg.toFixed(1)}</span>
        <span className="text-muted-foreground">({v.ratingCount})</span>
      </div>
    </div>
  );
  if (v.slug) {
    return (
      <Link href={`/vendors/${v.slug}`} aria-label={v.name}>
        {body}
      </Link>
    );
  }
  return body;
}

export function SimilarVendorsRail({ vendors, title = 'Similar vendors' }: SimilarVendorsRailProps) {
  if (!vendors || vendors.length === 0) return null;
  return (
    <section aria-label={title} className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
        {vendors.map((v) => (
          <Tile key={v.id} v={v} />
        ))}
      </div>
    </section>
  );
}
