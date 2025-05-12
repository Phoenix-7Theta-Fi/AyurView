import { Type } from '@google/genai';
import type { Product } from '@/lib/types';
import { mockProducts } from '@/lib/mockData';

// Function declaration for product recommendations
export const getProductsForPurchaseDeclaration = {
  name: 'getProductsForPurchase',
  description: 'Get a list of 1 to 3 products for purchase based on user interest or keywords.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      keywords: {
        type: Type.STRING,
        description: 'Keywords or product type the user is interested in (e.g., ashwagandha, soap, tea, supplement, etc.)',
      },
      count: {
        type: Type.NUMBER,
        description: 'Number of products to return (between 1 and 3).',
      },
    },
    required: ['keywords', 'count'],
  },
};

// Function implementation for product recommendations
export const handleProductRecommendations = (
  fnCall: { args: { keywords?: string; count?: number } }
): { products: Product[]; text: string } => {
  const { keywords, count } = fnCall.args;

  // Filter products based on keywords
  const filtered = mockProducts.filter(
    (p: Product) =>
      p.stock > 0 &&
      (typeof keywords === 'string' &&
        (p.name.toLowerCase().includes(keywords.toLowerCase()) ||
          p.category.toLowerCase().includes(keywords.toLowerCase()) ||
          p.description.toLowerCase().includes(keywords.toLowerCase())))
  );

  // Select appropriate number of products
  const selected =
    filtered.length > 0
      ? filtered.slice(0, Math.max(1, Math.min(3, Number(count) || 1)))
      : mockProducts.filter((p: Product) => p.stock > 0).slice(0, Math.max(1, Math.min(3, Number(count) || 1)));

  return {
    products: selected,
    text: 'Here are some products you might like:'
  };
};
