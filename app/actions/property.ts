// server auth helper (improved)
"use server"

import { cookies } from "next/headers";
import { jwtVerify, type JWTVerifyResult } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export type AuthPayload = {
  userId: string;   // string form of ObjectId
  role?: string;
  iat?: number;
  exp?: number;
};

// Verify JWT from httpOnly cookie and return payload or null
export async function getAuthUser(): Promise<AuthPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const verified: JWTVerifyResult = await jwtVerify(token, secret);
    // minimal validation: ensure payload has userId
    const payload = verified.payload as unknown as AuthPayload;
    if (!payload?.userId) return null;
    return payload;
  } catch (err) {
    // don't leak error details
    return null;
  }
}
