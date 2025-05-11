import { NextRequest, NextResponse } from 'next/server';
import { mongodb } from '@/lib/mongodb';
import { verify } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

interface YogaPractice {
  userId: ObjectId;
  timestamp: Date;
  type: string;
  practice: string;
  subPractice: string;
  element: string;
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
}

interface ElementData {
  totalDuration: number;
}

interface SubPracticeData {
  elements: Record<string, ElementData>;
  totalDuration: number;
}

interface PracticeData {
  subPractices: Record<string, SubPracticeData>;
  totalDuration: number;
}

interface TypeGroup {
  practices: Record<string, PracticeData>;
  totalDuration: number;
}

interface SunburstNode {
  name: string;
  value: number;
  children?: SunburstNode[];
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

    // Get date range from query params (optional)
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get MongoDB database instance
    const db = mongodb.db("ayurview");

    // Build query
    const query: any = { userId };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Fetch yoga practices
    const practices = await db
      .collection<YogaPractice>('yogaPractices')
      .find(query)
      .sort({ timestamp: -1 })
      .toArray() as unknown as YogaPractice[];

    // Transform data for sunburst chart
    const transformedData = transformToSunburstData(practices);

    return NextResponse.json(transformedData);
  } catch (error: any) {
    console.error('Error fetching yoga practices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yoga practices' },
      { status: 500 }
    );
  }
}

function transformToSunburstData(practices: YogaPractice[]): SunburstNode[] {
  // Step 1: Group and aggregate data
  const groupedData = practices.reduce((acc: Record<string, {
    totalDuration: number;
    practices: Record<string, {
      totalDuration: number;
      subPractices: Record<string, {
        totalDuration: number;
        elements: Record<string, { totalDuration: number }>;
      }>;
    }>;
  }>, practice) => {
    // Initialize type level
    if (!acc[practice.type]) {
      acc[practice.type] = { totalDuration: 0, practices: {} };
    }

    // Initialize practice level
    if (!acc[practice.type].practices[practice.practice]) {
      acc[practice.type].practices[practice.practice] = { totalDuration: 0, subPractices: {} };
    }

    // Initialize subPractice level
    if (!acc[practice.type].practices[practice.practice].subPractices[practice.subPractice]) {
      acc[practice.type].practices[practice.practice].subPractices[practice.subPractice] = {
        totalDuration: 0,
        elements: {},
      };
    }

    // Initialize element level
    if (!acc[practice.type].practices[practice.practice].subPractices[practice.subPractice].elements[practice.element]) {
      acc[practice.type].practices[practice.practice].subPractices[practice.subPractice].elements[practice.element] = {
        totalDuration: 0,
      };
    }

    // Update durations
    const duration = practice.duration;
    acc[practice.type].totalDuration += duration;
    acc[practice.type].practices[practice.practice].totalDuration += duration;
    acc[practice.type].practices[practice.practice].subPractices[practice.subPractice].totalDuration += duration;
    acc[practice.type].practices[practice.practice].subPractices[practice.subPractice].elements[practice.element].totalDuration += duration;

    return acc;
  }, {});

  // Step 2: Transform to sunburst format
  return Object.entries(groupedData).map(([type, typeData]): SunburstNode => ({
    name: type,
    value: typeData.totalDuration,
    children: Object.entries(typeData.practices).map(([practice, practiceData]): SunburstNode => ({
      name: practice,
      value: practiceData.totalDuration,
      children: Object.entries(practiceData.subPractices).map(([subPractice, subPracticeData]): SunburstNode => ({
        name: subPractice,
        value: subPracticeData.totalDuration,
        children: Object.entries(subPracticeData.elements).map(([element, elementData]): SunburstNode => ({
          name: element,
          value: elementData.totalDuration,
        })),
      })),
    })),
  }));
}
