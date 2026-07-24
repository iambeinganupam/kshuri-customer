import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

const p = { id: 'p1', name: 'Hair Serum', priceInr: 450, photos: [], ratingAvg: 4.3, ratingCount: 12 };

describe('ProductCard', () => {
  it('renders name + price + rating', () => {
    render(<ProductCard product={p} vendorSlug="glow" />);
    expect(screen.getByText('Hair Serum')).toBeInTheDocument();
    expect(screen.getByText(/450/)).toBeInTheDocument();
    expect(screen.getByText('4.3')).toBeInTheDocument();
  });

  it('renders as a link to /vendors/{slug}/products/{id}', () => {
    render(<ProductCard product={p} vendorSlug="glow" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/vendors/glow/products/p1');
  });
});
