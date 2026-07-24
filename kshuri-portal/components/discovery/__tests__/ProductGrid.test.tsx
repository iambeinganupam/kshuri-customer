import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductGrid } from '../ProductGrid';

describe('ProductGrid', () => {
  it('renders one card per product', () => {
    const products = Array.from({ length: 3 }, (_, i) => ({
      id: `p${i}`, name: `Prod ${i}`, priceInr: 100 + i, photos: [], ratingAvg: 4, ratingCount: 1,
    }));
    render(<ProductGrid products={products} vendorSlug="glow" />);
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('renders nothing visible when products is empty', () => {
    const { container } = render(<ProductGrid products={[]} vendorSlug="glow" />);
    expect(container.querySelector('a')).toBeNull();
  });
});
