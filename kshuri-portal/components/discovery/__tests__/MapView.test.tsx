import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock react-leaflet so the test doesn't need a real DOM-mounted map.
vi.mock('react-leaflet', () => {
  return {
    MapContainer: ({ children, ...rest }: any) => (
      <div data-testid="map-container" data-center={JSON.stringify(rest.center)} data-zoom={rest.zoom}>
        {children}
      </div>
    ),
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({ children, position, eventHandlers }: any) => (
      <div
        data-testid="marker"
        data-pos={JSON.stringify(position)}
        onClick={() => eventHandlers?.click?.()}
      >
        {children}
      </div>
    ),
    Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  };
});

// Stub the leaflet CSS import so vitest doesn't trip on it.
vi.mock('leaflet/dist/leaflet.css', () => ({}));

import { MapViewClient } from '../MapView.client';

const items = [
  { id: 'v1', slug: 'glow-mumbai', name: 'Glow Mumbai', lat: 19.07, lng: 72.87 },
  { id: 'v2', slug: 'aisha-mua',   name: 'Aisha MUA',   lat: 19.10, lng: 72.85 },
  { id: 'v3', slug: null,          name: 'No slug',     lat: 19.20, lng: 72.90 },
];

describe('MapViewClient', () => {
  it('renders the map container with center + zoom + tile layer', () => {
    render(<MapViewClient items={items} center={{ lat: 19.07, lng: 72.87 }} zoom={12} />);
    const container = screen.getByTestId('map-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('data-zoom', '12');
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  });

  it('renders one marker per item', () => {
    render(<MapViewClient items={items} center={{ lat: 19.07, lng: 72.87 }} />);
    expect(screen.getAllByTestId('marker')).toHaveLength(3);
  });

  it('calls onPinClick(id) when a marker is clicked', () => {
    const onPinClick = vi.fn();
    render(<MapViewClient items={items} center={{ lat: 19.07, lng: 72.87 }} onPinClick={onPinClick} />);
    fireEvent.click(screen.getAllByTestId('marker')[1]);
    expect(onPinClick).toHaveBeenCalledWith('v2');
  });

  it('renders a popup link for each item with a slug', () => {
    render(<MapViewClient items={items} center={{ lat: 19.07, lng: 72.87 }} />);
    const popups = screen.getAllByTestId('popup');
    expect(popups).toHaveLength(3);
    expect(screen.getByRole('link', { name: /Glow Mumbai/i })).toHaveAttribute('href', '/vendors/glow-mumbai');
  });

  it('renders just the name (no link) when slug is null', () => {
    render(<MapViewClient items={items} center={{ lat: 19.07, lng: 72.87 }} />);
    const noSlug = screen.getByText('No slug');
    expect(noSlug.closest('a')).toBeNull();
  });
});
