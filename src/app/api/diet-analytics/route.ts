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
  console.log('Diet analytics API called');
  try {
    // Check authentication
    const authHeader = request.headers.get("authorization");
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

    // Get user ID
    const user = await db.collection("users").findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch diet analytics data
    const dietData = await db.collection("dietAnalytics")
      .find({
        userId: new ObjectId(user._id),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .toArray();

    // Transform data to match the DietAnalyticsChart component format
    const transformedData = dietData.map(record => ({
      day: record.date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      Protein: record.nutrients.protein,
      Carbs: record.nutrients.carbs,
      Fats: record.nutrients.fats,
      Vitamins: record.nutrients.vitamins,
      Minerals: record.nutrients.minerals
    }));

    // Sort data by date ascending
    transformedData.sort((a, b) => {
      const dateA = new Date(a.day);
      const dateB = new Date(b.day);
      return dateA.getTime() - dateB.getTime();
    });

    console.log('Returning data:', transformedData.length, 'records');
    return NextResponse.json(transformedData);

  } catch (error) {
    console.error("Error fetching diet analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch diet analytics data" },
      { status: 500 }
    );
  }
}
