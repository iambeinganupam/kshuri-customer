import Image from 'next/image';
import Link from 'next/link';
import { Image as ImageIcon, IndianRupee, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  priceInr: number;
  photos: string[];
  ratingAvg: number;
  ratingCount: number;
}

interface ProductCardProps {
  product: Product;
  vendorSlug: string;
}

const priceFmt = new Intl.NumberFormat('en-IN');

export function ProductCard({ product, vendorSlug }: ProductCardProps) {
  const cover = product.photos[0];
  return (
    <Link
      href={`/vendors/${vendorSlug}/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground transition hover:shadow-sm"
    >
      <div className="relative aspect-square w-full bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" aria-hidden />
          </div>
        )}
      </div>
      <div className="space-y-1 p-3">
        <div className="line-clamp-2 text-sm font-medium">{product.name}</div>
        <div className="flex items-center gap-1 text-sm font-semibold">
          <IndianRupee className="h-3.5 w-3.5" aria-hidden />
          {priceFmt.format(product.priceInr)}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" aria-hidden />
          <span className="text-foreground">{product.ratingAvg.toFixed(1)}</span>
          <span>({product.ratingCount})</span>
        </div>
      </div>
    </Link>
  );
}
