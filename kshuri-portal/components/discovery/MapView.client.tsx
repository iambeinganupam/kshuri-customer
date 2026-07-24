'use client';

import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

interface MapItem {
  id: string;
  slug: string | null;
  name: string;
  lat: number;
  lng: number;
}

export interface MapViewProps {
  items: MapItem[];
  center: { lat: number; lng: number };
  zoom?: number;
  onPinClick?: (id: string) => void;
  className?: string;
}

/** Inner client-only map. Use the MapView wrapper for SSR-safe imports. */
export function MapViewClient({ items, center, zoom = 12, onPinClick, className }: MapViewProps) {
  return (
    <div className={className ?? 'h-full w-full overflow-hidden rounded-lg border'}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {items.map((it) => (
          <Marker
            key={it.id}
            position={[it.lat, it.lng]}
            eventHandlers={{
              click: () => onPinClick?.(it.id),
            }}
          >
            <Popup>
              {it.slug ? (
                <Link href={`/vendors/${it.slug}`}>{it.name}</Link>
              ) : (
                <span>{it.name}</span>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
