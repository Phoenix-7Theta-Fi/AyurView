import { MongoClient, ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/utils';
import type { Practitioner } from '@/lib/types';

interface AvailabilitySlot {
  date: string;
  time: string;
  available: boolean;
}

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

// GET consultations, optionally filter by practitioner or date range
// Returns only your own consultations when authenticated
export async function GET(req: NextRequest) {
  try {
    const token = await getToken(req);
    const isAuthenticated = await verifyJwtToken(token);
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const practitionerId = searchParams.get('practitionerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const { db } = await connectToDatabase();
    const consultations = db.collection('consultations');

    // Build query based on filters
    const query: Record<string, any> = {};
    if (practitionerId) {
      query.practitionerId = new ObjectId(practitionerId);
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = startDate;
      }
      if (endDate) {
        query.date.$lte = endDate;
      }
    }

    const result = await consultations.find(query).toArray();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Book a new consultation
// Public access with rate limiting and booking validation
export async function POST(req: NextRequest) {
  try {
    const consultation = await req.json();
    const { practitionerId, date, time, mode } = consultation;

    if (!practitionerId || !date || !time || !mode) {
      return NextResponse.json({ 
        error: 'Missing required fields: practitionerId, date, time, mode'
      }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const consultations = db.collection('consultations');
    const practitioners = db.collection<Practitioner>('practitioners');

    // Verify practitioner exists
    const practitioner = await practitioners.findOne({ _id: new ObjectId(practitionerId) });
    if (!practitioner) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    // Check if slot is available
    const slotTaken = await consultations.findOne({
      practitionerId: new ObjectId(practitionerId),
      date,
      time
    });

    if (slotTaken) {
      return NextResponse.json({ error: 'Time slot already booked' }, { status: 400 });
    }

    // Verify the slot exists in practitioner's availability
    const slot = practitioner.availabilitySlots?.find(
      (slot: AvailabilitySlot) => slot.date === date && slot.time === time && slot.available
    );

    if (!slot) {
      return NextResponse.json({ error: 'Time slot is not available' }, { status: 400 });
    }

    // Book the consultation
    const now = new Date();
    const result = await consultations.insertOne({
      _id: new ObjectId(),
      practitionerId: new ObjectId(practitionerId),
      practitionerName: practitioner.name,
      specialization: practitioner.specialization,
      date,
      time,
      mode,
      createdAt: now,
      updatedAt: now
    });

    // Update the availability slot
    await practitioners.updateOne(
      { 
        _id: new ObjectId(practitionerId),
        'availabilitySlots.date': date,
        'availabilitySlots.time': time
      },
      { $set: { 'availabilitySlots.$.available': false } }
    );

    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      consultation: {
        id: result.insertedId,
        practitionerName: practitioner.name,
        specialization: practitioner.specialization,
        date,
        time,
        mode
      }
    });
  } catch (error) {
    console.error('Error booking consultation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Cancel a consultation
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
      return NextResponse.json({ error: 'Consultation ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const consultations = db.collection('consultations');

    // Get consultation details before deleting
    const consultation = await consultations.findOne({ _id: new ObjectId(id) });
    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    // Delete the consultation
    await consultations.deleteOne({ _id: new ObjectId(id) });

    // Make the slot available again
    await db.collection('practitioners').updateOne(
      { 
        _id: consultation.practitionerId,
        'availabilitySlots.date': consultation.date,
        'availabilitySlots.time': consultation.time
      },
      { $set: { 'availabilitySlots.$.available': true } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling consultation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update consultation details (e.g., reschedule)
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
      return NextResponse.json({ error: 'Consultation ID is required' }, { status: 400 });
    }

    const updates = await req.json();
    const { date, time } = updates;

    const { db } = await connectToDatabase();
    const consultations = db.collection('consultations');

    // Get current consultation
    const currentConsultation = await consultations.findOne({ _id: new ObjectId(id) });
    if (!currentConsultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    // If rescheduling, check if new slot is available
    if (date && time) {
      const slotTaken = await consultations.findOne({
        _id: { $ne: new ObjectId(id) },
        practitionerId: currentConsultation.practitionerId,
        date,
        time
      });

      if (slotTaken) {
        return NextResponse.json({ error: 'Time slot already booked' }, { status: 400 });
      }

      // Verify the new slot exists in practitioner's availability
      const practitioner = await db.collection<Practitioner>('practitioners').findOne({
        _id: currentConsultation.practitionerId
      });

      const slot = practitioner?.availabilitySlots?.find(
        (slot: AvailabilitySlot) => slot.date === date && slot.time === time && slot.available
      );

      if (!slot) {
        return NextResponse.json({ error: 'Time slot is not available' }, { status: 400 });
      }

      // Update slot availability
      await db.collection('practitioners').updateOne(
        { 
          _id: currentConsultation.practitionerId,
          'availabilitySlots.date': currentConsultation.date,
          'availabilitySlots.time': currentConsultation.time
        },
        { $set: { 'availabilitySlots.$.available': true } }
      );

      await db.collection('practitioners').updateOne(
        { 
          _id: currentConsultation.practitionerId,
          'availabilitySlots.date': date,
          'availabilitySlots.time': time
        },
        { $set: { 'availabilitySlots.$.available': false } }
      );
    }

    // Update consultation
    await consultations.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating consultation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
