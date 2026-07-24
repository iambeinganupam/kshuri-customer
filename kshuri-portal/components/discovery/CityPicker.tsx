'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { setGeo } from '@/lib/geo/use-geo';

interface CityPickerProps {
  value: { city: string; lat?: number; lng?: number };
  popularCities: Array<{ slug: string; name: string }>;
  onChange: (v: { city: string; lat: number; lng: number }) => void;
}

function displayName(slug: string): string {
  if (!slug) return '';
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function CityPicker({ value, popularCities, onChange }: CityPickerProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const filtered = popularCities.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase()),
  );

  const pickManual = (city: { slug: string; name: string }) => {
    const next = { city: city.slug, lat: 0, lng: 0 };
    onChange(next);
    void setGeo({ city: city.slug, region: 'IN', lat: 0, lng: 0, source: 'manual' });
    setOpen(false);
  };

  const useMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const next = { city: 'your-location', lat, lng };
        onChange(next);
        void setGeo({ city: 'your-location', region: 'IN', lat, lng, source: 'browser' });
        setOpen(false);
      },
      () => {
        /* permission denied — silently ignore in R1 */
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <MapPin className="h-4 w-4" aria-hidden />
          <span>{displayName(value.city) || 'Pick a city'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pick your city</DialogTitle>
          <DialogDescription className="sr-only">
            Search for a city, use your current location, or pick from popular cities.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search city"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search city"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={useMyLocation}
          >
            <MapPin className="h-4 w-4" aria-hidden />
            Use my location
          </Button>
          <ul className="max-h-[260px] space-y-1 overflow-y-auto" role="listbox">
            {filtered.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  className="w-full rounded-md px-3 py-2 text-left hover:bg-muted"
                  onClick={() => pickManual(c)}
                  role="option"
                  aria-selected={c.slug === value.city}
                >
                  {c.name}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">No cities match &quot;{q}&quot;</li>
            )}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
