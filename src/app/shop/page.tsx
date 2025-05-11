'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch('/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary tracking-tight sm:text-4xl">
            Loading products...
          </h1>
        </div>
        {/* Loading skeleton grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-96 bg-card animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary tracking-tight sm:text-4xl">
          Error Loading Products
        </h1>
        <p className="text-lg text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary tracking-tight sm:text-4xl">
          AyurAid Wellness Shop
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover our curated selection of authentic Ayurvedic products for your holistic well-being.
        </p>
      </div>
      
      {/* Placeholder for Filters and Search - Future Enhancement */}
      {/* 
      <div className="py-4 px-2 bg-card rounded-lg shadow-sm border border-border">
        <p className="text-center text-muted-foreground">Filters and Search Functionality (Coming Soon)</p>
      </div> 
      */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && !loading && !error && (
        <div className="text-center">
          <p className="text-lg text-muted-foreground">No products available at the moment.</p>
        </div>
      )}

      <div className="text-center mt-12">
        <Badge variant="secondary" className="text-sm p-2">
          More Ayurvedic treasures coming soon!
        </Badge>
      </div>
    </div>
  );
}
