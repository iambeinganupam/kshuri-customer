// ─────────────────────────────────────────────────────────────────────────────
// Vendor detail page (server RSC)
// ─────────────────────────────────────────────────────────────────────────────
// Server-fetches the vendor by slug, emits JSON-LD scripts into the INITIAL
// HTML response (so Googlebot / Bing / Slack unfurls see structured data
// without running JavaScript), and renders the interactive body inside a
// client component. The client component then refetches via React Query for
// freshness and hydration parity.
//
// Failure modes are deliberately quiet — if the server fetch fails (network
// blip, backend cold start), we render the client component with no JSON-LD
// and let its in-flight query take over. We never block the page on the
// server fetch.
// ─────────────────────────────────────────────────────────────────────────────

import { discoveryService } from "@kshuri/api-client/services"
import type { VendorDetail } from "@kshuri/api-client"
import { apiClient } from "@/lib/api/client"
import { BreadcrumbJsonLd } from "@/components/discovery/jsonld/BreadcrumbJsonLd"
import { LocalBusinessJsonLd } from "@/components/discovery/jsonld/LocalBusinessJsonLd"
import { AggregateRatingJsonLd } from "@/components/discovery/jsonld/AggregateRatingJsonLd"
import { VendorDetailClient } from "./_components/VendorDetailClient"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kshuri.in"

async function fetchVendorDetailQuietly(slug: string): Promise<VendorDetail | null> {
  try {
    return await discoveryService.getVendorBySlug(apiClient, slug)
  } catch {
    return null
  }
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const detail = await fetchVendorDetailQuietly(slug)

  const vendorUrl = `${APP_URL}/vendors/${slug}`
  const name = detail?.display_name || detail?.business_name || slug
  const heroImage = detail?.gallery?.[0]?.file_url
  const ratingValue = detail?.avg_rating == null ? 0 : Number(detail.avg_rating)
  const ratingCount = detail?.review_count ?? 0

  return (
    <>
      {detail ? (
        <>
          <BreadcrumbJsonLd
            items={[
              { name: "Home", url: `${APP_URL}/` },
              { name: "Vendors", url: `${APP_URL}/vendors` },
              { name, url: vendorUrl },
            ]}
          />
          <LocalBusinessJsonLd
            name={name}
            url={vendorUrl}
            telephone={detail.contact_phone ?? undefined}
            image={heroImage}
            address={{
              line1: detail.address_line1 ?? null,
              city: detail.city ?? null,
              region: detail.state ?? null,
            }}
          />
          {ratingCount > 0 && (
            <AggregateRatingJsonLd
              itemReviewed={{ "@type": "LocalBusiness", name }}
              ratingValue={ratingValue}
              reviewCount={ratingCount}
            />
          )}
        </>
      ) : null}

      <VendorDetailClient slug={slug} />
    </>
  )
}
