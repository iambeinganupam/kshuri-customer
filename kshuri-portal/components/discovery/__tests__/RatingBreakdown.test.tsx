import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RatingBreakdown } from '../RatingBreakdown';

describe('RatingBreakdown', () => {
  it('renders avg formatted to one decimal + total label', () => {
    render(
      <RatingBreakdown
        avg={4.62}
        total={128}
        breakdown={{ 1: 1, 2: 2, 3: 5, 4: 30, 5: 90 }}
      />,
    );
    expect(screen.getByText('4.6')).toBeInTheDocument();
    expect(screen.getByText(/128/)).toBeInTheDocument();
  });

  it('renders 5 rows in descending star order with counts', () => {
    render(
      <RatingBreakdown
        avg={4.0}
        total={10}
        breakdown={{ 1: 1, 2: 1, 3: 2, 4: 3, 5: 3 }}
      />,
    );
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(5);
    // Row 0 should be 5★
    expect(rows[0]).toHaveTextContent(/5/);
    expect(rows[0]).toHaveTextContent(/3/);
    // Row 4 should be 1★
    expect(rows[4]).toHaveTextContent(/1/);
  });

  it('handles total = 0 gracefully (all bars at 0%)', () => {
    render(
      <RatingBreakdown
        avg={0}
        total={0}
        breakdown={{ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }}
      />,
    );
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });
});
