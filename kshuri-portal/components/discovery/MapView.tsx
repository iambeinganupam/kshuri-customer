'use client';

import dynamic from 'next/dynamic';
import type { MapViewProps } from './MapView.client';

const MapViewClient = dynamic(
  () => import('./MapView.client').then((m) => m.MapViewClient),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-muted" /> },
);

export function MapView(props: MapViewProps) {
  return <MapViewClient {...props} />;
}

export type { MapViewProps };
