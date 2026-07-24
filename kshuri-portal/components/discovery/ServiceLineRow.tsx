'use client';

import Image from 'next/image';
import { Clock, IndianRupee, Star, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Service {
  id: string;
  name: string;
  priceInr: number;
  durationMin: number;
  genderTarget: 'male' | 'female' | 'unisex';
  serviceMode: 'home' | 'onsite' | 'both';
  photos: string[];
  ratingAvg: number;
  ratingCount: number;
}

interface ServiceLineRowProps {
  service: Service;
  onBook: (id: string) => void;
  bookEnabled: boolean;
}

const priceFmt = new Intl.NumberFormat('en-IN');

const GENDER_LABEL: Record<Service['genderTarget'], string> = {
  male: 'Men',
  female: 'Women',
  unisex: 'Unisex',
};

const MODE_LABEL: Record<Service['serviceMode'], string> = {
  home: 'At home',
  onsite: 'In-salon',
  both: 'Home or salon',
};

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground">
      {children}
    </span>
  );
}

export function ServiceLineRow({ service, onBook, bookEnabled }: ServiceLineRowProps) {
  const photos = service.photos.slice(0, 3);
  const GenderIcon = service.genderTarget === 'unisex' ? Users : User;

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-3 text-card-foreground">
      {photos.length > 0 && (
        <div className="flex shrink-0 gap-1">
          {photos.map((src, idx) => (
            <div
              key={`${src}-${idx}`}
              className="relative h-14 w-14 overflow-hidden rounded-md bg-muted"
            >
              <Image src={src} alt="" fill sizes="56px" className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="font-semibold">{service.name}</div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Chip>
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" aria-hidden />
            {service.ratingAvg.toFixed(1)}
            <span className="text-muted-foreground">({service.ratingCount})</span>
          </Chip>
          <Chip>
            <IndianRupee className="h-3 w-3" aria-hidden />
            {priceFmt.format(service.priceInr)}
          </Chip>
          <Chip>
            <Clock className="h-3 w-3" aria-hidden />
            {service.durationMin} min
          </Chip>
          <Chip>
            <GenderIcon className="h-3 w-3" aria-hidden />
            {GENDER_LABEL[service.genderTarget]}
          </Chip>
          <Chip>{MODE_LABEL[service.serviceMode]}</Chip>
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        disabled={!bookEnabled}
        onClick={() => onBook(service.id)}
      >
        Book
      </Button>
    </div>
  );
}
