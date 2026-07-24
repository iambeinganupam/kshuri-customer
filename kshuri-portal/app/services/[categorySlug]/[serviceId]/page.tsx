// ─────────────────────────────────────────────────────────────────────────────
// /services/[categorySlug]/[serviceId] — Service detail page (RSC + ISR)
// ─────────────────────────────────────────────────────────────────────────────
// Server-rendered service detail surface for SEO + share-link UX. Hydrates from
// the catalog public-service endpoint (Task 5.4) and emits Breadcrumb +
// LocalBusiness (for the offering vendor) + AggregateRating JSON-LD. ISR every
// 5 minutes, tagged so writes can revalidateTag('service:<id>').
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, IndianRupee, MapPin, Star, User } from 'lucide-react';

import { AggregateRatingJsonLd } from '@/components/discovery/jsonld/AggregateRatingJsonLd';
import { BreadcrumbJsonLd } from '@/components/discovery/jsonld/BreadcrumbJsonLd';
import { LocalBusinessJsonLd } from '@/components/discovery/jsonld/LocalBusinessJsonLd';

interface PublicServiceDetail {
  id: string;
  name: string;
  description: string | null;
  priceInr: number;
  durationMin: number;
  genderTarget: 'male' | 'female' | 'unisex';
  serviceMode: 'home' | 'onsite' | 'both';
  photos: string[];
  category: { id: string; slug: string; name: string } | null;
  vendor: {
    id: string;
    slug: string | null;
    name: string;
    type: 'freelancer' | 'salon_location';
    ratingAvg: number;
    ratingCount: number;
  };
  reviewAggregate: { ratingAvg: number; ratingCount: number };
}

async function getService(id: string): Promise<PublicServiceDetail | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api/v1';
  const res = await fetch(`${base}/catalog/services/${id}/public`, {
    next: { revalidate: 300, tags: [`service:${id}`] },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to load service: ${res.status}`);
  }
  const json = (await res.json()) as { success: true; data: PublicServiceDetail };
  return json.data;
}

const rupees = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const display = (slug: string) =>
  slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string; serviceId: string }>;
}) {
  const { serviceId } = await params;
  const svc = await getService(serviceId);
  if (!svc) return { title: 'Service not found | Kshuri' };
  return {
    title: `${svc.name} — by ${svc.vendor.name} | Kshuri`,
    description:
      svc.description?.slice(0, 160) ?? `Book ${svc.name} with ${svc.vendor.name}.`,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ categorySlug: string; serviceId: string }>;
}) {
  const { categorySlug, serviceId } = await params;
  const svc = await getService(serviceId);
  if (!svc) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kshuri.in';
  const catName = svc.category?.name ?? display(categorySlug);

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: `${baseUrl}/` },
          { name: 'Services', url: `${baseUrl}/services` },
          { name: catName, url: `${baseUrl}/services/${categorySlug}` },
          { name: svc.name, url: `${baseUrl}/services/${categorySlug}/${serviceId}` },
        ]}
      />
      {svc.vendor.slug && (
        <LocalBusinessJsonLd
          name={svc.vendor.name}
          url={`${baseUrl}/vendors/${svc.vendor.slug}`}
        />
      )}
      {svc.reviewAggregate.ratingCount > 0 && (
        <AggregateRatingJsonLd
          itemReviewed={{ '@type': 'Service', name: svc.name }}
          ratingValue={svc.reviewAggregate.ratingAvg}
          reviewCount={svc.reviewAggregate.ratingCount}
        />
      )}

      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <ol className="flex items-center gap-1">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/services" className="hover:text-foreground">
              Services
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/services/${categorySlug}`} className="hover:text-foreground">
              {catName}
            </Link>
          </li>
          <li>/</li>
          <li className="line-clamp-1 font-medium text-foreground">{svc.name}</li>
        </ol>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-semibold sm:text-4xl">{svc.name}</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
            <IndianRupee className="h-3.5 w-3.5" aria-hidden />₹{rupees.format(svc.priceInr)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {svc.durationMin} min
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
            <User className="h-3.5 w-3.5" aria-hidden />
            {svc.genderTarget}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {svc.serviceMode === 'onsite'
              ? 'At the salon'
              : svc.serviceMode === 'home'
                ? 'At home'
                : 'At home or salon'}
          </span>
        </div>
      </header>

      {svc.description && (
        <section aria-label="Description" className="prose prose-sm max-w-none">
          <p>{svc.description}</p>
        </section>
      )}

      <section aria-label="Vendor" className="space-y-3">
        <h2 className="text-lg font-semibold">Offered by</h2>
        {svc.vendor.slug ? (
          <Link
            href={`/vendors/${svc.vendor.slug}`}
            className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-muted/40"
          >
            <div>
              <div className="font-medium">{svc.vendor.name}</div>
              <div className="text-xs text-muted-foreground">
                {svc.vendor.type === 'freelancer' ? 'Freelancer' : 'Salon'}
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden />
              <span className="tabular-nums">{svc.vendor.ratingAvg.toFixed(1)}</span>
              <span className="text-muted-foreground">({svc.vendor.ratingCount})</span>
            </div>
          </Link>
        ) : (
          <div className="rounded-lg border bg-card p-4">
            <div className="font-medium">{svc.vendor.name}</div>
          </div>
        )}
      </section>

      <section aria-label="Reviews" className="space-y-3">
        <h2 className="text-lg font-semibold">Reviews</h2>
        {svc.reviewAggregate.ratingCount === 0 ? (
          <p className="text-muted-foreground">No reviews yet for this service.</p>
        ) : (
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 fill-amber-500 text-amber-500" aria-hidden />
            <span className="text-2xl font-semibold tabular-nums">
              {svc.reviewAggregate.ratingAvg.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({svc.reviewAggregate.ratingCount} ratings)
            </span>
          </div>
        )}
      </section>
    </main>
  );
}
