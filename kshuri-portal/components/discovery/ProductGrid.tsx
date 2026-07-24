import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  priceInr: number;
  photos: string[];
  ratingAvg: number;
  ratingCount: number;
}

interface ProductGridProps {
  products: Product[];
  vendorSlug: string;
}

export function ProductGrid({ products, vendorSlug }: ProductGridProps) {
  if (products.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} vendorSlug={vendorSlug} />
      ))}
    </div>
  );
}
