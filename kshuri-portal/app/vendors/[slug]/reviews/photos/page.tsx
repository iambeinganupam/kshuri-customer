import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BreadcrumbJsonLd } from '@/components/discovery/jsonld/BreadcrumbJsonLd';

interface VendorProfile {
  vendor: { id: string; slug: string; name: string };
}

interface ReviewWithPhotos {
  id: string;
  customer_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  photos: Array<{ url: string; w?: number | null; h?: number | null }>;
  helpful_count: number;
  created_at: string;
}

async function getVendorIdBySlug(slug: string): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api/v1';
  const res = await fetch(`${base}/discover/vendors/${encodeURIComponent(slug)}/profile`, {
    next: { revalidate: 300, tags: [`vendor:${slug}`] },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { success: true; data: VendorProfile };
  return json.data.vendor.id;
}

async function getPhotoReviews(vendorId: string): Promise<ReviewWithPhotos[]> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api/v1';
  const params = new URLSearchParams({
    target_kind: 'vendor',
    target_id: vendorId,
    with_photos: 'true',
    sort: 'recent',
    limit: '24',
  });
  const res = await fetch(`${base}/engagement/reviews?${params}`, {
    next: { revalidate: 60, tags: [`vendor:${vendorId}`, `vendor:${vendorId}:reviews`] },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as {
    success: true;
    data: ReviewWithPhotos[];
    meta: { nextCursor: string | null };
  };
  return json.data;
}

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const display = slug.replace(/-/g, ' ');
  return {
    title: `Photo reviews — ${display} | Kshuri`,
    description: `Browse customer photos from real reviews of ${display}.`,
  };
}

export default async function VendorPhotoReviewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendorId = await getVendorIdBySlug(slug);
  if (!vendorId) notFound();

  const reviews = await getPhotoReviews(vendorId);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kshuri.in';

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: `${baseUrl}/` },
          { name: 'Vendors', url: `${baseUrl}/vendors` },
          { name: slug, url: `${baseUrl}/vendors/${slug}` },
          { name: 'Photo reviews', url: `${baseUrl}/vendors/${slug}/reviews/photos` },
        ]}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <ol className="flex items-center gap-1">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/vendors/${slug}`} className="hover:text-foreground">
              {slug.replace(/-/g, ' ')}
            </Link>
          </li>
          <li>/</li>
          <li className="font-medium text-foreground">Photo reviews</li>
        </ol>
      </nav>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Photo reviews</h1>
        <p className="text-sm text-muted-foreground">
          {reviews.length} review{reviews.length === 1 ? '' : 's'} with photos
        </p>
      </header>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground">No photo reviews yet.</p>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {reviews.flatMap((r) =>
            r.photos.map((p, i) => (
              <figure
                key={`${r.id}-${i}`}
                className="mb-3 break-inside-avoid overflow-hidden rounded-lg border bg-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary CDN URLs not allowlisted yet */}
                <img
                  src={p.url}
                  alt={r.title ?? `Photo from review #${r.id.slice(0, 8)}`}
                  className="w-full"
                />
                <figcaption className="space-y-1 p-2 text-xs">
                  {r.title && <p className="line-clamp-1 font-medium">{r.title}</p>}
                  <p className="text-muted-foreground">
                    {r.rating}★ · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </figcaption>
              </figure>
            )),
          )}
        </div>
      )}

      <Link
        href={`/vendors/${slug}`}
        className="inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to {slug.replace(/-/g, ' ')}
      </Link>
    </main>
  );
}
