import { NextResponse } from 'next/server';
import { connectToDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import type { SleepWellnessData } from '@/lib/types';

// Helper function to verify JWT token
function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded?.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get date range from query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Connect to database
    const client = await connectToDb();
    const db = client.db('ayurview');

    // Get user ID
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: decoded.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const collection = db.collection<SleepWellnessData>('sleepWellness');

    // Build query with date range and userId
    const query: any = { userId: new ObjectId(user._id) };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Fetch sleep wellness data
    console.log('Query:', query);
    const sleepWellnessData = await collection
      .find(query)
      .sort({ date: 1 })
      .toArray();
    
    console.log('Found sleep wellness records:', sleepWellnessData.length);

    // Transform data for the chart component
    console.log('First record sample:', sleepWellnessData[0]);
    const formattedData = sleepWellnessData.map((data) => ({
      day: new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      // Sleep metrics
      REM: data.sleepMetrics.rem,
      Deep: data.sleepMetrics.deep,
      Light: data.sleepMetrics.light,
      Awake: data.sleepMetrics.awake,
      // Mental wellness metrics for the line chart
      stressLevel: data.mentalWellness.stressLevel,
      moodScore: data.mentalWellness.moodScore,
    }));

    return NextResponse.json({
      success: true,
      data: formattedData
    });

  } catch (error: any) {
    console.error('Error fetching sleep wellness data:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch sleep wellness data' },
      { status: 500 }
    );
  }
}
