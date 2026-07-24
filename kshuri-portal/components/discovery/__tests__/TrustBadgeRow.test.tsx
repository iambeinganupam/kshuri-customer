import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrustBadgeRow } from '../TrustBadgeRow';

describe('TrustBadgeRow', () => {
  it('renders Verified + KYC done + Top rated when all three badges present', () => {
    render(<TrustBadgeRow badges={['verified', 'kyc_done', 'top_rated']} />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('KYC done')).toBeInTheDocument();
    expect(screen.getByText('Top rated')).toBeInTheDocument();
  });

  it('appends repeat-customer chip when pct >= 30', () => {
    render(<TrustBadgeRow badges={['verified']} repeatCustomerPct={42} />);
    expect(screen.getByText(/Loved by repeat customers/i)).toBeInTheDocument();
    expect(screen.getByText(/42%/)).toBeInTheDocument();
  });

  it('does NOT append repeat-customer chip when pct < 30', () => {
    render(<TrustBadgeRow badges={['verified']} repeatCustomerPct={20} />);
    expect(screen.queryByText(/Loved by repeat customers/i)).not.toBeInTheDocument();
  });

  it('renders an unknown badge value as its raw string', () => {
    render(<TrustBadgeRow badges={['fast_responder']} />);
    expect(screen.getByText('fast_responder')).toBeInTheDocument();
  });
});
