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
  console.log('Workout metrics API called');
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

    // Connect to database and get client
    console.log('Connecting to database...');
    const client = await connectToDb();
    console.log('Connected to database successfully');

    // Get user ID
    console.log('Finding user with email:', decoded.email);
    const user = await client.db("ayurview")
      .collection("users")
      .findOne({ email: decoded.email });
    console.log('Found user:', user ? user : 'not found');
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch workout metrics data
    const metricsData = await client.db("ayurview")
      .collection("workoutMetrics")
      .find({
        userId: new ObjectId(user._id),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ date: -1 }) // Get most recent first
      .toArray();

    // Transform data to match the frontend's expected format
    const transformedData = metricsData.map(record => ({
      date: record.date,
      metrics: record.metrics
    }));

    // Get the most recent metrics for the radar chart
    const latestMetrics = transformedData[0]?.metrics || null;

    // Format the data for the radar chart
    const radarData = latestMetrics ? [
      {
        metric: "Strength",
        "Actual Score": latestMetrics.strength.actual,
        "Target Score": latestMetrics.strength.target
      },
      {
        metric: "Flexibility",
        "Actual Score": latestMetrics.flexibility.actual,
        "Target Score": latestMetrics.flexibility.target
      },
      {
        metric: "VO2 Max",
        "Actual Score": latestMetrics.vo2Max.actual,
        "Target Score": latestMetrics.vo2Max.target
      },
      {
        metric: "Endurance",
        "Actual Score": latestMetrics.endurance.actual,
        "Target Score": latestMetrics.endurance.target
      },
      {
        metric: "Agility",
        "Actual Score": latestMetrics.agility.actual,
        "Target Score": latestMetrics.agility.target
      }
    ] : [];

    console.log('Returning data:', radarData.length > 0 ? 'Latest metrics available' : 'No metrics found');
    return NextResponse.json(radarData);

  } catch (error) {
    console.error("Error fetching workout metrics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout metrics data" },
      { status: 500 }
    );
  }
}
