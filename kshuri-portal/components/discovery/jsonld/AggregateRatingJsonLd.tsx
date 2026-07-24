interface AggregateRatingJsonLdProps {
  itemReviewed: { '@type': string; name: string };
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export function AggregateRatingJsonLd(props: AggregateRatingJsonLdProps) {
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    itemReviewed: props.itemReviewed,
    ratingValue: props.ratingValue,
    reviewCount: props.reviewCount,
    bestRating: props.bestRating ?? 5,
    worstRating: props.worstRating ?? 1,
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />
  );
}
