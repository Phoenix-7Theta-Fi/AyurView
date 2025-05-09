
'use client';

import type { Product } from '@/lib/types';
import ProductCard from '@/components/shop/ProductCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/contexts/CartContext';

interface ProductArtifactDisplayProps {
  products: Product[];
  // onDetails: (productName: string) => void; // This could be used if product card didn't handle its own details
}

export default function ProductArtifactDisplay({ products }: ProductArtifactDisplayProps) {
  const { addToCart } = useCart();

  if (!products || products.length === 0) {
    return <p className="text-muted-foreground text-sm p-4">No products to display.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3"> {/* Single column for artifact view might be better */}
      {products.map(product => (
        // ProductCard already handles add to cart via its own useCart hook.
        // If ProductCard needed external onDetails, it would be passed here.
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
