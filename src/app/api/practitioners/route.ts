import { MongoClient, ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/utils';

// Get JWT token from authorization header helper
async function getToken(req: NextRequest): Promise<string> {
  // First try Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Fallback to cookie token
  const cookiesList = await cookies();
  const token = cookiesList.get('token');
  return token?.value || '';
}

// GET all practitioners or filter by specialization/location
// This endpoint is public - no authentication required
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get('specialization');
    const location = searchParams.get('location');

    const { db } = await connectToDatabase();
    const practitioners = db.collection('practitioners');

    // Build query based on filters
    const query: Record<string, any> = {};
    if (specialization) {
      query.specialization = specialization;
    }
    if (location) {
      query.location = location;
    }

    const result = await practitioners.find(query).toArray();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching practitioners:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST endpoint for creating a new practitioner (admin only)
export async function POST(req: NextRequest) {
  try {
    const token = await getToken(req);
    const isAuthenticated = await verifyJwtToken(token);
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const practitioner = await req.json();
    const { db } = await connectToDatabase();
    const practitioners = db.collection('practitioners');

    const now = new Date();
    const result = await practitioners.insertOne({
      ...practitioner,
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error creating practitioner:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH endpoint for updating practitioner details (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken(req);
    const isAuthenticated = await verifyJwtToken(token);
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Practitioner ID is required' }, { status: 400 });
    }

    const updates = await req.json();
    const { db } = await connectToDatabase();
    const practitioners = db.collection('practitioners');

    const result = await practitioners.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating practitioner:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE endpoint for removing a practitioner (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken(req);
    const isAuthenticated = await verifyJwtToken(token);
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Practitioner ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const practitioners = db.collection('practitioners');

    const result = await practitioners.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting practitioner:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
