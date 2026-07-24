import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SimilarVendorsRail } from '../SimilarVendorsRail';

const vendors = [
  { id: 'v1', slug: 'glow-mumbai', name: 'Glow Mumbai', type: 'salon_location' as const, ratingAvg: 4.6, ratingCount: 80 },
  { id: 'v2', slug: 'aisha-mua',   name: 'Aisha MUA',   type: 'freelancer'    as const, ratingAvg: 4.9, ratingCount: 42 },
  { id: 'v3', slug: null,          name: 'No-slug',     type: 'salon_location' as const, ratingAvg: 4.0, ratingCount: 5 },
];

describe('SimilarVendorsRail', () => {
  it('returns null when vendors is empty', () => {
    const { container } = render(<SimilarVendorsRail vendors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders one tile per vendor with name + rating', () => {
    render(<SimilarVendorsRail vendors={vendors} />);
    expect(screen.getByText('Glow Mumbai')).toBeInTheDocument();
    expect(screen.getByText('Aisha MUA')).toBeInTheDocument();
    expect(screen.getByText('No-slug')).toBeInTheDocument();
    expect(screen.getByText('4.6')).toBeInTheDocument();
  });

  it('renders a link to /vendors/{slug} when slug is present', () => {
    render(<SimilarVendorsRail vendors={vendors} />);
    const glowLink = screen.getByRole('link', { name: /Glow Mumbai/i });
    expect(glowLink).toHaveAttribute('href', '/vendors/glow-mumbai');
  });

  it('does NOT render a link for a vendor with null slug', () => {
    render(<SimilarVendorsRail vendors={vendors} />);
    const noSlug = screen.getByText('No-slug');
    expect(noSlug.closest('a')).toBeNull();
  });

  it('renders the default title "Similar vendors"', () => {
    render(<SimilarVendorsRail vendors={vendors} />);
    expect(screen.getByText('Similar vendors')).toBeInTheDocument();
  });
});
