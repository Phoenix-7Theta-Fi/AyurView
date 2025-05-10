import { NextResponse } from "next/server";
import { createUser } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { z } from "zod";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: result.error.errors },
        { status: 400 }
      );
    }

    const { firstName, email, password } = result.data;

    // Create user in the database
    const user = await createUser(firstName, email, password);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "7d" }
    );

    return NextResponse.json({ token, user }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    if (error instanceof Error && error.message === "User already exists") {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
