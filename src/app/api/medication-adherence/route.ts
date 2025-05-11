import { connectToDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { startOfMonth, endOfMonth } from "date-fns";
import jwt from "jsonwebtoken";

// Helper function to verify JWT token
function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "default-secret") as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  console.log('Medication adherence API called');
  try {
    // Check authentication
    const authHeader = request.headers.get("authorization");
    console.log('Auth header:', authHeader);
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    
    if (!decoded?.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse query parameters for date range
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    // Get start and end of the month for the query
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);

    // Connect to database
    console.log('Connecting to database...');
    const client = await connectToDb();
    const db = client.db("ayurview");
    console.log('Connected to database successfully');

    // Get user ID
    console.log('Finding user with email:', decoded.email);
    const usersCollection = db.collection("users");
    const allUsers = await usersCollection.find({}).toArray();
    console.log('All users:', allUsers.map(u => u.email));
    
    const user = await usersCollection.findOne({ email: decoded.email });
    console.log('Found user:', user ? user : 'not found');
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch medication adherence data
    const adherenceData = await db.collection("medicationAdherence")
      .find({
        userId: new ObjectId(user._id),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .toArray();

    // Transform data to match the expected format
    const transformedData = adherenceData.map(record => ({
      date: record.date,
      adherence: record.adherence
    }));

    console.log('Returning data:', transformedData.length, 'records');
    return NextResponse.json(transformedData);

  } catch (error) {
    console.error("Error fetching medication adherence data:", error);
    return NextResponse.json(
      { error: "Failed to fetch medication adherence data" },
      { status: 500 }
    );
  }
}
