
import ProductCard from '@/components/shop/ProductCard';
import { mockProducts } from '@/lib/mockData'; // Updated import
import { Badge } from '@/components/ui/badge';

export default function ShopPage() {
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
        {mockProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center mt-12">
        <Badge variant="secondary" className="text-sm p-2">
          More Ayurvedic treasures coming soon!
        </Badge>
      </div>
    </div>
  );
}
