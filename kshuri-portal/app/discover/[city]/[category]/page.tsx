// ─────────────────────────────────────────────────────────────────────────────
// /discover/[city]/[category] — City + category vendor list (RSC + ISR)
// ─────────────────────────────────────────────────────────────────────────────
// Server-rendered listing for the (city, category) intersection. Hydrates from
// the discovery search endpoint with sort_by=rating_desc, supports cursor
// pagination via ?cursor=..., and emits BreadcrumbJsonLd for SEO. ISR every 5
// minutes, tagged so writes can call revalidateTag('city:<slug>') or
// revalidateTag('category:<slug>') to invalidate on demand.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Star } from 'lucide-react';

import { BreadcrumbJsonLd } from '@/components/discovery/jsonld/BreadcrumbJsonLd';

interface VendorListItem {
  id: string;
  slug: string;
  name: string;
  type: 'freelancer' | 'salon_location';
  ratingAvg: number;
  ratingCount: number;
  city: string | null;
  categorySlug: string | null;
  priceMin: number | null;
  priceMax: number | null;
  photoCount: number;
  verified: boolean;
  isOpenNow: boolean;
  distanceKm: number | null;
  lat: number | null;
  lng: number | null;
}

async function search(city: string, category: string, cursor?: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api/v1';
  const params = new URLSearchParams({ city, category, sort_by: 'rating_desc', limit: '20' });
  if (cursor) params.set('cursor', cursor);
  const res = await fetch(`${base}/discover/search?${params}`, {
    next: { revalidate: 300, tags: [`city:${city}`, `category:${category}`] },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to load search: ${res.status}`);
  }
  const json = (await res.json()) as {
    success: true;
    data: VendorListItem[];
    meta: { nextCursor: string | null };
  };
  return { items: json.data, nextCursor: json.meta?.nextCursor ?? null };
}

const rupees = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function display(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
}

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}) {
  const { city, category } = await params;
  return {
    title: `${display(category)} in ${display(city)} | Kshuri`,
    description: `Discover ${display(category)} services and vendors in ${display(city)}. Compare prices, ratings, and book in minutes.`,
  };
}

export default async function CityCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string; category: string }>;
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { city, category } = await params;
  const { cursor } = await searchParams;
  const result = await search(city, category, cursor);
  if (!result) notFound();

  const cityDisplay = display(city);
  const catDisplay = display(category);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kshuri.in';

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: `${baseUrl}/` },
          { name: 'Discover', url: `${baseUrl}/discover` },
          { name: cityDisplay, url: `${baseUrl}/discover/${city}` },
          { name: catDisplay, url: `${baseUrl}/discover/${city}/${category}` },
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
            <Link href="/discover" className="hover:text-foreground">
              Discover
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/discover/${city}`} className="hover:text-foreground">
              {cityDisplay}
            </Link>
          </li>
          <li>/</li>
          <li className="font-medium text-foreground">{catDisplay}</li>
        </ol>
      </nav>

      <header className="space-y-1">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          {catDisplay} in {cityDisplay}
        </h1>
        <p className="text-muted-foreground">{result.items.length} vendors</p>
      </header>

      {result.items.length === 0 ? (
        <p className="text-muted-foreground">
          No vendors yet — we&apos;re growing in {cityDisplay}.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((v) => (
            <li key={v.id}>
              <Link
                href={`/vendors/${v.slug}`}
                className="block space-y-2 rounded-lg border bg-card p-4 hover:bg-muted/40"
              >
                <h2 className="line-clamp-1 font-medium">{v.name}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-muted px-2 py-0.5">
                    {v.type === 'freelancer' ? 'Freelancer' : 'Salon'}
                  </span>
                  {v.verified && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700">
                      Verified
                    </span>
                  )}
                  {v.isOpenNow && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700">
                      Open now
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden />
                  <span className="tabular-nums">{v.ratingAvg.toFixed(1)}</span>
                  <span className="text-muted-foreground">({v.ratingCount})</span>
                </div>
                {v.priceMin !== null && (
                  <div className="text-sm text-muted-foreground">
                    From ₹{rupees.format(v.priceMin)}
                  </div>
                )}
                {v.city && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" aria-hidden />
                    {v.city}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {result.nextCursor && (
        <div className="flex justify-center pt-4">
          <Link
            href={{
              pathname: `/discover/${city}/${category}`,
              query: { cursor: result.nextCursor },
            }}
            className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
          >
            Load more
          </Link>
        </div>
      )}
    </main>
  );
}
