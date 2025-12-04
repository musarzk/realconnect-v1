// app/api/auth/register/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

// Use the same DB helper you used elsewhere - adjust the path if needed
import { getUsersCollection } from "@/lib/db";

const RegisterSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
});

// temp: include in responses for debugging only. Remove in production.
function buildErrorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

// helper to create cookie
function setTokenCookie(res: NextResponse, token: string) {
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

// Local fallback token generator using jose SignJWT (if your authv0.generateToken is missing)
async function localGenerateToken(userId: string, email: string, role = "user") {
  const secretEnv = process.env.JWT_SECRET || "dev-secret";
  const secret = new TextEncoder().encode(secretEnv);
  const token = await new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  return token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RegisterSchema.parse(body);

    // Basic env checks
    if (!process.env.MONGODB_URI) {
      console.error("[register] MONGODB_URI missing");
      return buildErrorResponse("Server misconfiguration: MONGODB_URI is missing", 500);
    }

    // get users collection (this may throw if DB connection fails)
    const users = await getUsersCollection();
    if (!users) {
      console.error("[register] getUsersCollection returned falsy");
      return buildErrorResponse("Server DB error", 500);
    }

    // duplicate email check (case-insensitive)
    const existing = await users.findOne({ email: { $regex: `^${validated.email}$`, $options: "i" } });
    if (existing) return buildErrorResponse("Email already registered", 409);

    // hash password and insert
    const hashed = await bcrypt.hash(validated.password, 10);
    const now = new Date();
    const newUser: any = {
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email.toLowerCase(),
      phone: validated.phone || null,
      password: hashed,
      role: "user",
      approved: false, // Users must be approved by admin
      favorites: [],
      createdAt: now,
      updatedAt: now,
    };

    const insertRes = await users.insertOne(newUser);
    if (!insertRes.acknowledged) {
      console.error("[register] insertOne not acknowledged:", insertRes);
      return buildErrorResponse("Failed to create user", 500);
    }
    const userId = insertRes.insertedId!.toString();

    // Return success WITHOUT logging the user in
    // User must wait for admin approval before they can login
    const response = NextResponse.json(
      {
        message: "Account created successfully. Please wait for admin approval.",
        user: {
          id: userId,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          approved: newUser.approved,
        },
      },
      { status: 201 }
    );

    return response;
  } catch (err: any) {
  // Zod errors
  if (err?.name === "ZodError") {
    console.error("[register] validation error:", err.errors);
    return buildErrorResponse(err.errors?.[0]?.message || "Invalid input", 400);
  }

  // Log stack for debugging (visible in your terminal)
  console.error("[register] unexpected error:", err?.stack ?? err);

  // Return the message to the client for debugging — remove in production
  const serverMsg = err?.message || "Registration failed (server error)";
  return buildErrorResponse(serverMsg, 500);
}
}
