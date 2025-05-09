
import ProductCard from '@/components/shop/ProductCard';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const mockProducts: Product[] = [
  {
    id: 'prod1',
    name: 'Ashwagandha Capsules',
    description: 'Powerful adaptogen for stress relief, vitality, and cognitive function. Organic and sustainably sourced.',
    price: 15.99,
    imageUrl: 'https://picsum.photos/seed/ashwagandha_capsules/400/400',
    dataAiHint: 'herbal supplement bottle',
    category: 'Supplements',
    stock: 50,
  },
  {
    id: 'prod2',
    name: 'Triphala Churna',
    description: 'Traditional Ayurvedic blend for digestion, detoxification, and colon health. Made from three potent fruits.',
    price: 12.50,
    imageUrl: 'https://picsum.photos/seed/triphala_powder/400/400',
    dataAiHint: 'ayurvedic powder',
    category: 'Herbal Powders',
    stock: 30,
  },
  {
    id: 'prod3',
    name: 'Organic Turmeric Latte Mix',
    description: 'Delicious and healthy golden milk mix with turmeric, ginger, cinnamon, and black pepper. Boosts immunity.',
    price: 18.75,
    imageUrl: 'https://picsum.photos/seed/turmeric_latte/400/400',
    dataAiHint: 'golden milk spice',
    category: 'Wellness Drinks',
    stock: 25,
  },
  {
    id: 'prod4',
    name: 'Neem & Tulsi Soap',
    description: 'Handmade Ayurvedic soap with neem and tulsi extracts for clear, healthy skin. Antiseptic properties.',
    price: 7.99,
    imageUrl: 'https://picsum.photos/seed/neem_soap/400/400',
    dataAiHint: 'herbal soap bar',
    category: 'Personal Care',
    stock: 75,
  },
  {
    id: 'prod5',
    name: 'Brahmi Oil for Hair',
    description: 'Nourishing hair oil infused with Brahmi to promote hair growth, reduce dandruff, and calm the mind.',
    price: 22.00,
    imageUrl: 'https://picsum.photos/seed/brahmi_oil/400/400',
    dataAiHint: 'hair oil bottle',
    category: 'Hair Care',
    stock: 15,
  },
  {
    id: 'prod6',
    name: 'Chyawanprash - Ayurvedic Jam',
    description: 'A rich, herbal jam known for its rejuvenating and immune-boosting properties. A blend of over 40 herbs.',
    price: 25.50,
    imageUrl: 'https://picsum.photos/seed/chyawanprash_jar/400/400',
    dataAiHint: 'ayurvedic jam jar',
    category: 'Herbal Jams',
    stock: 40,
  },
   {
    id: 'prod7',
    name: 'Herbal Teatox Blend',
    description: 'A detoxifying tea blend with ginger, lemon, and Ayurvedic herbs to cleanse and rejuvenate the system.',
    price: 14.99,
    imageUrl: 'https://picsum.photos/seed/herbal_tea/400/400',
    dataAiHint: 'tea box herbs',
    category: 'Wellness Teas',
    stock: 60,
  },
  {
    id: 'prod8',
    name: 'Shatavari Root Powder',
    description: 'Known as a female reproductive tonic, Shatavari supports hormonal balance and overall wellness for women.',
    price: 16.50,
    imageUrl: 'https://picsum.photos/seed/shatavari_powder/400/400',
    dataAiHint: 'herbal powder bag',
    category: 'Herbal Powders',
    stock: 0, // Out of stock example
  },
];

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
