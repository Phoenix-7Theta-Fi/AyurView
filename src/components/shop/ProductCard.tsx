
'use client';

import type { Product } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, PlusCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader className="p-0">
        <div className="relative w-full h-56">
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={product.dataAiHint || "product image"}
            className="rounded-t-lg"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold text-primary mb-1">{product.name}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mb-2">{product.category}</CardDescription>
        <p className="text-sm text-foreground/90 mb-3 h-16 overflow-y-auto text-ellipsis">
          {product.description}
        </p>
        <p className="text-lg font-bold text-accent mt-2">${product.price.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {product.stock > 0 ? `${product.stock} in stock` : <span className="text-destructive">Out of stock</span>}
        </p>
      </CardContent>
      <CardFooter className="p-4 bg-muted/30">
        <Button 
          onClick={handleAddToCart} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={product.stock === 0}
        >
          <PlusCircle size={18} className="mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
