import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CityPicker } from '../CityPicker';

vi.mock('@/lib/geo/use-geo', () => ({
  useGeo: () => null,
  setGeo: vi.fn(),
}));

describe('CityPicker', () => {
  const popularCities = [
    { slug: 'mumbai',    name: 'Mumbai' },
    { slug: 'delhi',     name: 'Delhi' },
    { slug: 'bengaluru', name: 'Bengaluru' },
  ];

  beforeEach(() => vi.clearAllMocks());

  it('shows the current city in the trigger chip', () => {
    render(
      <CityPicker
        value={{ city: 'mumbai', lat: 19.076, lng: 72.877 }}
        popularCities={popularCities}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /Mumbai/i })).toBeInTheDocument();
  });

  it('opens the modal when the chip is clicked', async () => {
    render(
      <CityPicker
        value={{ city: 'mumbai' }}
        popularCities={popularCities}
        onChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Mumbai/i }));
    expect(await screen.findByPlaceholderText(/Search city/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Use my location/i })).toBeInTheDocument();
  });

  it('calls onChange + setGeo with source=manual when a popular city is picked', async () => {
    const onChange = vi.fn();
    const { setGeo } = await import('@/lib/geo/use-geo');

    render(
      <CityPicker
        value={{ city: 'mumbai' }}
        popularCities={popularCities}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Mumbai/i }));
    fireEvent.click(await screen.findByRole('option', { name: 'Delhi' }));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ city: 'delhi' }));
    expect(setGeo).toHaveBeenCalledWith(expect.objectContaining({ city: 'delhi', source: 'manual' }));
  });

  it('filters popular cities by the search query', async () => {
    render(
      <CityPicker
        value={{ city: 'mumbai' }}
        popularCities={popularCities}
        onChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Mumbai/i }));
    fireEvent.change(await screen.findByPlaceholderText(/Search city/i), { target: { value: 'beng' } });
    expect(screen.getByRole('option', { name: 'Bengaluru' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Delhi' })).not.toBeInTheDocument();
  });
});
