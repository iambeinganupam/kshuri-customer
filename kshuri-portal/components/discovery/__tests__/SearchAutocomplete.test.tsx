import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchAutocomplete } from '../SearchAutocomplete';

// Mock the api-client hook so the component can be tested without HTTP.
vi.mock('@kshuri/api-client', () => ({
  useAutocomplete: vi.fn(),
}));

import { useAutocomplete } from '@kshuri/api-client';

const fixture = {
  vendors:    [{ id: 'v1', slug: 'glow-mumbai', name: 'Glow Mumbai',  city: 'Mumbai', vendorType: 'salon_location' as const, score: 0.7 }],
  services:   [{ id: 's1', name: 'Bridal Makeup', vendorSlug: 'aisha-mua', vendorName: 'Aisha MUA', vendorType: 'freelancer' as const, score: 0.6 }],
  categories: [{ id: 'c1', slug: 'bridal', name: 'Bridal' }],
};

beforeEach(() => {
  vi.clearAllMocks();
  (useAutocomplete as any).mockReturnValue({ data: undefined, isLoading: false, isError: false });
});

describe('SearchAutocomplete', () => {
  it('renders the input and an empty state when there is no query', () => {
    render(<SearchAutocomplete onSelect={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Search vendors, services/i)).toBeInTheDocument();
  });

  it('renders three groups (Vendors, Services, Categories) when data is present', () => {
    (useAutocomplete as any).mockReturnValue({ data: fixture, isLoading: false, isError: false });
    render(<SearchAutocomplete onSelect={vi.fn()} />);
    expect(screen.getByText('Vendors')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Glow Mumbai')).toBeInTheDocument();
    expect(screen.getByText('Bridal Makeup')).toBeInTheDocument();
    expect(screen.getByText('Bridal')).toBeInTheDocument();
  });

  it('calls onSelect with the correct kind/id/slug when a vendor item is picked', () => {
    (useAutocomplete as any).mockReturnValue({ data: fixture, isLoading: false, isError: false });
    const onSelect = vi.fn();
    render(<SearchAutocomplete onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Glow Mumbai'));
    expect(onSelect).toHaveBeenCalledWith({ kind: 'vendor', id: 'v1', slug: 'glow-mumbai' });
  });

  it('calls onSelect with kind=service when a service item is picked', () => {
    (useAutocomplete as any).mockReturnValue({ data: fixture, isLoading: false, isError: false });
    const onSelect = vi.fn();
    render(<SearchAutocomplete onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Bridal Makeup'));
    expect(onSelect).toHaveBeenCalledWith({ kind: 'service', id: 's1', slug: 'aisha-mua' });
  });

  it('calls onSelect with kind=category when a category item is picked', () => {
    (useAutocomplete as any).mockReturnValue({ data: fixture, isLoading: false, isError: false });
    const onSelect = vi.fn();
    render(<SearchAutocomplete onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Bridal'));
    expect(onSelect).toHaveBeenCalledWith({ kind: 'category', id: 'c1', slug: 'bridal' });
  });

  it('shows the empty state when data has no items', () => {
    (useAutocomplete as any).mockReturnValue({ data: { vendors: [], services: [], categories: [] }, isLoading: false, isError: false });
    render(<SearchAutocomplete onSelect={vi.fn()} />);
    expect(screen.getByText(/No results/i)).toBeInTheDocument();
  });
});
