import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ServiceLineRow } from '../ServiceLineRow';

const baseService = {
  id: 's1',
  name: 'Bridal Makeup',
  priceInr: 12000,
  durationMin: 120,
  genderTarget: 'female' as const,
  serviceMode: 'onsite' as const,
  photos: [],
  ratingAvg: 4.8,
  ratingCount: 24,
};

describe('ServiceLineRow', () => {
  it('renders service name + chips + Book button', () => {
    render(<ServiceLineRow service={baseService} onBook={vi.fn()} bookEnabled />);
    expect(screen.getByText('Bridal Makeup')).toBeInTheDocument();
    expect(screen.getByText(/12,000/)).toBeInTheDocument();
    expect(screen.getByText(/120 min/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Book/i })).toBeInTheDocument();
  });

  it('disables the Book button when bookEnabled is false', () => {
    render(<ServiceLineRow service={baseService} onBook={vi.fn()} bookEnabled={false} />);
    expect(screen.getByRole('button', { name: /Book/i })).toBeDisabled();
  });

  it('calls onBook with the service id when clicked', () => {
    const onBook = vi.fn();
    render(<ServiceLineRow service={baseService} onBook={onBook} bookEnabled />);
    fireEvent.click(screen.getByRole('button', { name: /Book/i }));
    expect(onBook).toHaveBeenCalledWith('s1');
  });

  it('renders the rating average + count', () => {
    render(<ServiceLineRow service={baseService} onBook={vi.fn()} bookEnabled />);
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText(/24/)).toBeInTheDocument();
  });
});
