import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/utils';
import jwt from 'jsonwebtoken';

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

export async function GET(req: NextRequest) {
  try {
    const token = await getToken(req);
    
    // Verify and decode token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Query treatment plan for the user
    const treatmentPlan = await db.collection('treatmentPlans')
      .findOne({ userId: new ObjectId(decoded.userId) });

    if (!treatmentPlan) {
      return NextResponse.json({ error: 'Treatment plan not found' }, { status: 404 });
    }

    return NextResponse.json(treatmentPlan);
  } catch (error) {
    console.error('Error fetching treatment plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
