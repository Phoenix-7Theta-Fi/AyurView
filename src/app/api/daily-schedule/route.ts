import { NextRequest, NextResponse } from 'next/server';
import { mongodb } from '@/lib/mongodb';
import { verify } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import type { TreatmentPlanActivity } from '@/lib/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    const userId = new ObjectId(decoded.userId);

    // Get MongoDB database instance
    const db = mongodb.db("ayurview");

    // Fetch daily schedule activities for the user
    const schedule = await db
      .collection<TreatmentPlanActivity>('daily-schedules')
      .find({ userId })
      .sort({ time: 1 })  // Sort by time
      .toArray();

    return NextResponse.json({
      success: true,
      data: schedule
    });

  } catch (error: any) {
    console.error('Error fetching daily schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily schedule' },
      { status: 500 }
    );
  }
}
