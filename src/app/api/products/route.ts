import { connectToDatabase } from '@/lib/mongodb';
import { verifyJwtToken } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

interface MongoProduct {
  _id: ObjectId;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  dataAiHint?: string;
  category: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    // Initialize auth-related vars
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    // Verify authentication token
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const verified = await verifyJwtToken(token);
    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Connect to database
    const { db } = await connectToDatabase();
    const collection = db.collection<MongoProduct>('products');

    // Build query based on filters
    let query: any = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch products with query
    const products = await collection
      .find(query)
      .sort({ category: 1, name: 1 })
      .toArray();

    // Map MongoDB _id to id for frontend consistency
    const mappedProducts = products.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      dataAiHint: product.dataAiHint,
      category: product.category,
      stock: product.stock
    }));

    return NextResponse.json(mappedProducts);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
