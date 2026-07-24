// ─────────────────────────────────────────────────────────────────────────────
// /products/[id] — Product detail page (RSC + ISR)
// ─────────────────────────────────────────────────────────────────────────────
// Server-rendered product detail surface for SEO + share-link UX. Hydrates from
// the catalog public-product endpoint and emits Breadcrumb + Product +
// AggregateRating JSON-LD. ISR every 5 minutes, tagged so writes can
// revalidateTag('product:<id>').
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IndianRupee, Star, Tag } from 'lucide-react';

import { AggregateRatingJsonLd } from '@/components/discovery/jsonld/AggregateRatingJsonLd';
import { BreadcrumbJsonLd } from '@/components/discovery/jsonld/BreadcrumbJsonLd';
import { ProductJsonLd } from '@/components/discovery/jsonld/ProductJsonLd';

interface PublicProductDetail {
  id: string;
  name: string;
  description: string | null;
  priceInr: number;
  category: string | null;
  photos: string[];
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

async function getProduct(id: string): Promise<PublicProductDetail | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api/v1';
  const res = await fetch(`${base}/catalog/products/${id}/public`, {
    next: { revalidate: 300, tags: [`product:${id}`] },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to load product: ${res.status}`);
  }
  const json = (await res.json()) as { success: true; data: PublicProductDetail };
  return json.data;
}

const rupees = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) return { title: 'Product not found | Kshuri' };
  return {
    title: `${p.name} — by ${p.vendor.name} | Kshuri`,
    description: p.description?.slice(0, 160) ?? `Get ${p.name} from ${p.vendor.name}.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kshuri.in';

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: `${baseUrl}/` },
          { name: 'Products', url: `${baseUrl}/products` },
          { name: p.name, url: `${baseUrl}/products/${p.id}` },
        ]}
      />
      <ProductJsonLd
        name={p.name}
        description={p.description}
        image={p.photos}
        priceInr={p.priceInr}
        ratingAvg={p.reviewAggregate.ratingAvg}
        ratingCount={p.reviewAggregate.ratingCount}
      />
      {p.reviewAggregate.ratingCount > 0 && (
        <AggregateRatingJsonLd
          itemReviewed={{ '@type': 'Product', name: p.name }}
          ratingValue={p.reviewAggregate.ratingAvg}
          reviewCount={p.reviewAggregate.ratingCount}
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
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
          </li>
          <li>/</li>
          <li className="line-clamp-1 font-medium text-foreground">{p.name}</li>
        </ol>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-semibold sm:text-4xl">{p.name}</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
            <IndianRupee className="h-3.5 w-3.5" aria-hidden />₹{rupees.format(p.priceInr)}
          </span>
          {p.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
              <Tag className="h-3.5 w-3.5" aria-hidden />
              {p.category}
            </span>
          )}
        </div>
      </header>

      {p.description && (
        <section aria-label="Description" className="prose prose-sm max-w-none">
          <p>{p.description}</p>
        </section>
      )}

      <section aria-label="Vendor" className="space-y-3">
        <h2 className="text-lg font-semibold">Sold by</h2>
        {p.vendor.slug ? (
          <Link
            href={`/vendors/${p.vendor.slug}`}
            className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-muted/40"
          >
            <div>
              <div className="font-medium">{p.vendor.name}</div>
              <div className="text-xs text-muted-foreground">
                {p.vendor.type === 'freelancer' ? 'Freelancer' : 'Salon'}
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden />
              <span className="tabular-nums">{p.vendor.ratingAvg.toFixed(1)}</span>
              <span className="text-muted-foreground">({p.vendor.ratingCount})</span>
            </div>
          </Link>
        ) : (
          <div className="rounded-lg border bg-card p-4">
            <div className="font-medium">{p.vendor.name}</div>
          </div>
        )}
      </section>

      <section aria-label="Reviews" className="space-y-3">
        <h2 className="text-lg font-semibold">Reviews</h2>
        {p.reviewAggregate.ratingCount === 0 ? (
          <p className="text-muted-foreground">No reviews yet for this product.</p>
        ) : (
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 fill-amber-500 text-amber-500" aria-hidden />
            <span className="text-2xl font-semibold tabular-nums">
              {p.reviewAggregate.ratingAvg.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({p.reviewAggregate.ratingCount} ratings)
            </span>
          </div>
        )}
      </section>
    </main>
  );
}
