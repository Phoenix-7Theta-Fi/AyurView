import { NextRequest, NextResponse } from 'next/server';
import { mongodb } from '@/lib/mongodb';
import { verify } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import type { TreatmentPlanActivity } from '@/lib/types';

export async function PATCH(req: NextRequest) {
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

    // Get activity ID and new status from request body
    const { activityId, status } = await req.json();
    
    if (!activityId || !status) {
      return NextResponse.json(
        { error: 'Activity ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['pending', 'completed', 'missed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Get MongoDB database instance
    const db = mongodb.db("ayurview");

    // Update activity status
    const result = await db
      .collection<TreatmentPlanActivity>('daily-schedules')
      .updateOne(
        { 
          $or: [
            { _id: new ObjectId(activityId) },
            { id: activityId }
          ],
          userId 
        },
        { $set: { status } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Activity status updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating activity status:', error);
    return NextResponse.json(
      { error: 'Failed to update activity status' },
      { status: 500 }
    );
  }
}

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
