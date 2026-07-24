interface ProductJsonLdProps {
  name: string;
  description?: string | null;
  image?: string[];
  priceInr: number;
  ratingAvg?: number;
  ratingCount?: number;
}

export function ProductJsonLd(props: ProductJsonLdProps) {
  const payload: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: props.name,
    description: props.description ?? undefined,
    image: props.image,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: props.priceInr,
      availability: 'https://schema.org/InStock',
    },
  };
  if (props.ratingAvg !== undefined && props.ratingCount !== undefined && props.ratingCount > 0) {
    payload.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: props.ratingAvg,
      reviewCount: props.ratingCount,
    };
  }
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />
  );
}
