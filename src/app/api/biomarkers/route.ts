import { connectToDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { startOfDay, endOfDay } from "date-fns";
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
  console.log('Biomarkers API called');
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const biomarkerTypes = searchParams.get("types")?.split(",") || [];

    // Set date range
    const startDate = startDateParam ? startOfDay(new Date(startDateParam)) : startOfDay(new Date());
    const endDate = endDateParam ? endOfDay(new Date(endDateParam)) : endOfDay(new Date());

    // Connect to database
    const client = await connectToDb();
    const db = client.db("ayurview");

    // Get user ID
    const user = await db.collection("users").findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build query
    const query: any = {
      userId: new ObjectId(user._id),
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };

    // Add biomarker type filter if specified
    if (biomarkerTypes.length > 0) {
      query.biomarkerName = { $in: biomarkerTypes };
    }

    // Fetch biomarker data
    const biomarkerData = await db.collection("biomarkers")
      .find(query)
      .sort({ date: 1 })
      .toArray();

    // Transform MongoDB _id to string id for client
    const transformedData = biomarkerData.map(record => ({
      id: record._id.toString(),
      biomarkerName: record.biomarkerName,
      value: record.value,
      unit: record.unit,
      date: record.date,
      referenceRange: record.referenceRange,
      targetValue: record.targetValue
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      metadata: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalRecords: transformedData.length
      }
    });

  } catch (error) {
    console.error("Error fetching biomarker data:", error);
    return NextResponse.json(
      { error: "Failed to fetch biomarker data" },
      { status: 500 }
    );
  }
}
