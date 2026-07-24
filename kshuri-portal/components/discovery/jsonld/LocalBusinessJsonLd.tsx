interface LocalBusinessJsonLdProps {
  name: string;
  url: string;
  telephone?: string | null;
  address?: { line1?: string | null; city?: string | null; region?: string | null };
  geo?: { lat: number | null; lng: number | null };
  image?: string;
}

export function LocalBusinessJsonLd(props: LocalBusinessJsonLdProps) {
  const payload: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: props.name,
    url: props.url,
  };
  if (props.telephone) payload.telephone = props.telephone;
  if (props.image) payload.image = props.image;
  if (props.address) {
    payload.address = {
      '@type': 'PostalAddress',
      streetAddress: props.address.line1 ?? undefined,
      addressLocality: props.address.city ?? undefined,
      addressRegion: props.address.region ?? undefined,
      addressCountry: 'IN',
    };
  }
  if (props.geo && props.geo.lat !== null && props.geo.lng !== null) {
    payload.geo = {
      '@type': 'GeoCoordinates',
      latitude: props.geo.lat,
      longitude: props.geo.lng,
    };
  }
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />
  );
}
