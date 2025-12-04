// app/api/lib/authv0.ts
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTVerifyResult } from "jose";
import type { NextRequest } from "next/server";

/**
 * Shared secret for signing/verifying JWTs as Uint8Array
 */
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

/** Auth payload shape stored in JWTs */
export type AuthPayload = {
  userId: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
};

/** Hash plain password */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/** Compare plain password against hash */
export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

/** Generate signed JWT (HS256) */
export async function generateToken(
  userId: string,
  email?: string,
  role?: string,
  expiresInSeconds = 24 * 60 * 60
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(SECRET);
  return jwt;
}

/** Verify token and return jose.JWTVerifyResult (throws on invalid) */
export async function verifyToken(token: string): Promise<JWTVerifyResult> {
  return jwtVerify(token, SECRET);
}

/**
 * getAuthUserFromHeader
 * - Reads Authorization header from NextRequest and verifies token.
 * - Returns AuthPayload or null.
 *
 * Usage in app route:
 *   const user = await getAuthUserFromHeader(request)
 */
export async function getAuthUserFromHeader(request: NextRequest): Promise<AuthPayload | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7).trim();
    if (!token) return null;
    const verified = await jwtVerify(token, SECRET);
    const payload = verified.payload as unknown as AuthPayload;
    if (!payload?.userId) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * getAuthUserFromCookieToken
 * - Given a token string (e.g. from request.cookies.get('token')?.value), verifies and returns payload or null.
 * - This helper does not read cookies itself (keeps it simple and testable). In app routes you can do:
 *
 *   const token = request.cookies.get('token')?.value
 *   const user = await getAuthUserFromCookieToken(token)
 */
export async function getAuthUserFromCookieToken(token?: string): Promise<AuthPayload | null> {
  try {
    if (!token) return null;
    const verified = await jwtVerify(token, SECRET);
    const payload = verified.payload as unknown as AuthPayload;
    if (!payload?.userId) return null;
    return payload;
  } catch {
    return null;
  }
}
