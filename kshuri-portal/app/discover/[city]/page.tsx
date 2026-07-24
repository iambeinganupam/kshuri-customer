// ─────────────────────────────────────────────────────────────────────────────
// /discover/[city] — City landing page (RSC + ISR)
// ─────────────────────────────────────────────────────────────────────────────
// Server-rendered city landing for SEO + first-paint perf. Hydrates top vendors,
// popular categories, and trending services from the backend's CityLanding
// endpoint (Task 4.5). ISR-revalidated every 5 minutes; tagged so future writes
// can call `revalidateTag('city:<slug>')` to invalidate on demand.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IndianRupee, MapPin, Star, Users } from 'lucide-react';

import { BreadcrumbJsonLd } from '@/components/discovery/jsonld/BreadcrumbJsonLd';

interface CityLandingData {
  topVendors: Array<{
    id: string;
    slug: string | null;
    name: string;
    type: 'freelancer' | 'salon_location';
    ratingAvg: number;
    ratingCount: number;
  }>;
  topCategories: Array<{
    id: string;
    slug: string;
    name: string;
    serviceCount: number;
  }>;
  trendingServices: Array<{
    name: string;
    priceFrom: number;
    vendorCount: number;
  }>;
}

// Server-side fetch — ISR via Next.js fetch cache. Tagged for future
// on-write invalidation via `revalidateTag('city:<slug>')`.
async function getCityLanding(city: string): Promise<CityLandingData | null> {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api/v1';
  const res = await fetch(
    `${base}/discover/city/${encodeURIComponent(city)}`,
    { next: { revalidate: 300, tags: [`city:${city}`] } },
  );
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to load city: ${res.status}`);
  }
  const json = (await res.json()) as {
    success: true;
    data: CityLandingData;
  };
  return json.data;
}

const rupees = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function displayCity(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
}

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const display = displayCity(city);
  return {
    title: `Discover top grooming, wedding & events vendors in ${display} | Kshuri`,
    description: `Discover top-rated salons, freelancers and services in ${display}. Book grooming, bridal and event services with verified vendors.`,
  };
}

export default async function CityLandingPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const data = await getCityLanding(city);
  if (!data) notFound();

  const display = displayCity(city);
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://kshuri.in';

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:py-12">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: `${baseUrl}/` },
          { name: 'Discover', url: `${baseUrl}/discover` },
          { name: display, url: `${baseUrl}/discover/${city}` },
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
          <li className="font-medium text-foreground">{display}</li>
        </ol>
      </nav>

      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-semibold sm:text-4xl">
          <MapPin className="h-7 w-7 text-primary" aria-hidden />
          {display}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Discover top-rated salons, freelancers, and services for grooming,
          weddings, and events near you.
        </p>
      </header>

      <section aria-label="Top vendors" className="space-y-4">
        <h2 className="text-xl font-semibold">Top vendors</h2>
        {data.topVendors.length === 0 ? (
          <p className="text-muted-foreground">
            No vendors yet — we&apos;re growing in {display}.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {data.topVendors.map((v) => {
              const body = (
                <div className="space-y-2 rounded-lg border bg-card p-4 hover:bg-muted/40">
                  <h3 className="line-clamp-1 font-medium">{v.name}</h3>
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
                    {v.type === 'freelancer' ? 'Freelancer' : 'Salon'}
                  </span>
                  <div className="flex items-center gap-1 text-sm">
                    <Star
                      className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
                      aria-hidden
                    />
                    <span className="tabular-nums">
                      {v.ratingAvg.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      ({v.ratingCount})
                    </span>
                  </div>
                </div>
              );
              return (
                <li key={v.id}>
                  {v.slug ? <Link href={`/vendors/${v.slug}`}>{body}</Link> : body}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-label="Popular categories" className="space-y-4">
        <h2 className="text-xl font-semibold">Popular categories</h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {data.topCategories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/discover/${city}/${c.slug}`}
                className="block rounded-lg border bg-card p-4 hover:bg-muted/40"
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">
                  {c.serviceCount} services
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Trending services" className="space-y-4">
        <h2 className="text-xl font-semibold">Trending services</h2>
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          {data.trendingServices.map((s) => (
            <article
              key={s.name}
              className="min-w-[200px] snap-start space-y-2 rounded-lg border bg-card p-4"
            >
              <h3 className="line-clamp-2 font-medium">{s.name}</h3>
              <div className="flex items-center gap-1 text-sm">
                <IndianRupee className="h-3.5 w-3.5" aria-hidden />
                <span className="tabular-nums">
                  From ₹{rupees.format(s.priceFrom)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" aria-hidden />
                Available at {s.vendorCount} vendors
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
