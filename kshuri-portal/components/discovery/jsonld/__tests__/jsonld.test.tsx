import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LocalBusinessJsonLd }     from '../LocalBusinessJsonLd';
import { ProductJsonLd }           from '../ProductJsonLd';
import { AggregateRatingJsonLd }   from '../AggregateRatingJsonLd';
import { BreadcrumbJsonLd }        from '../BreadcrumbJsonLd';

function jsonOf(container: HTMLElement) {
  const script = container.querySelector('script[type="application/ld+json"]');
  if (!script || !script.textContent) throw new Error('no JSON-LD script found');
  return JSON.parse(script.textContent);
}

describe('LocalBusinessJsonLd', () => {
  it('emits a valid LocalBusiness payload', () => {
    const { container } = render(
      <LocalBusinessJsonLd
        name="Glow Mumbai"
        url="https://kshuri.in/vendors/glow-mumbai"
        telephone="+91-9999"
        address={{ line1: 'A1', city: 'Mumbai', region: 'MH' }}
        geo={{ lat: 19.07, lng: 72.87 }}
        image="https://cdn/glow.jpg"
      />,
    );
    const data = jsonOf(container);
    expect(data['@type']).toBe('LocalBusiness');
    expect(data.name).toBe('Glow Mumbai');
    expect(data.address.addressLocality).toBe('Mumbai');
    expect(data.geo.latitude).toBe(19.07);
  });
});

describe('ProductJsonLd', () => {
  it('emits a Product with offer and rating', () => {
    const { container } = render(
      <ProductJsonLd
        name="Hair Serum"
        description="Argan oil blend"
        image={['https://cdn/h1.jpg']}
        priceInr={450}
        ratingAvg={4.3}
        ratingCount={12}
      />,
    );
    const data = jsonOf(container);
    expect(data['@type']).toBe('Product');
    expect(data.offers.priceCurrency).toBe('INR');
    expect(data.offers.price).toBe(450);
    expect(data.aggregateRating.ratingValue).toBe(4.3);
  });

  it('omits aggregateRating when ratingCount is 0', () => {
    const { container } = render(
      <ProductJsonLd
        name="Hair Serum"
        priceInr={450}
        ratingAvg={0}
        ratingCount={0}
      />,
    );
    const data = jsonOf(container);
    expect(data.aggregateRating).toBeUndefined();
  });
});

describe('AggregateRatingJsonLd', () => {
  it('emits with default best/worstRating', () => {
    const { container } = render(
      <AggregateRatingJsonLd
        itemReviewed={{ '@type': 'LocalBusiness', name: 'Glow' }}
        ratingValue={4.6}
        reviewCount={80}
      />,
    );
    const data = jsonOf(container);
    expect(data.bestRating).toBe(5);
    expect(data.worstRating).toBe(1);
    expect(data.ratingValue).toBe(4.6);
  });
});

describe('BreadcrumbJsonLd', () => {
  it('emits an ordered BreadcrumbList', () => {
    const { container } = render(
      <BreadcrumbJsonLd
        items={[
          { name: 'Home',     url: 'https://kshuri.in/' },
          { name: 'Vendors',  url: 'https://kshuri.in/vendors' },
          { name: 'Glow',     url: 'https://kshuri.in/vendors/glow' },
        ]}
      />,
    );
    const data = jsonOf(container);
    expect(data['@type']).toBe('BreadcrumbList');
    expect(data.itemListElement).toHaveLength(3);
    expect(data.itemListElement[0].position).toBe(1);
    expect(data.itemListElement[2].name).toBe('Glow');
  });
});
