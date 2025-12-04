
// app/api/lib/auth.ts
"use server";

import { cookies as nextCookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTVerifyResult } from "jose";
import type { NextRequest } from "next/server";

/**
 * Keep secret as Uint8Array for jose APIs.
 * Make sure process.env.JWT_SECRET is set in .env.local (a reasonably long secret).
 */
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

/** Shape stored in JWT payload */
export type AuthPayload = {
  userId: string;
  email?: string;
  role?: "user" | "agent" | "admin" | string;
  iat?: number;
  exp?: number;
};

/**
 * getAuthUser(request?)
 * - If `request` is provided (typical for API routes), reads cookie from request.cookies
 * - Otherwise (server components / server actions), uses next/headers cookies()
 * - Returns AuthPayload on success or null if missing/invalid
 */
export async function getAuthUser(request?: NextRequest): Promise<AuthPayload | null> {
  try {
    // Prefer using request.cookies if a request was supplied (API routes)
    let token: string | undefined | null = null;

    if (request) {
      // NextRequest.cookies has .get(name)
      try {
        token = request.cookies.get?.("token")?.value ?? null;
      } catch {
        token = null;
      }
    } else {
      // Server components / actions: use next/headers cookies()
      try {
        const cookieStore = await nextCookies();
        token = cookieStore.get("token")?.value ?? null;
      } catch {
        token = null;
      }
    }

    if (!token) return null;

    const verified: JWTVerifyResult = await jwtVerify(token, SECRET);
    const payload = verified.payload as unknown as AuthPayload;

    if (!payload?.userId) return null;
    return payload;
  } catch (err) {
    // Do not leak details to clients; log server-side if you need deeper debugging.
    return null;
  }
}

/**
 * verifyAuthHeader(request)
 * - Primary for API routes where a bearer token may be sent in the Authorization header
 * - Falls back to checking the `token` cookie on the provided request
 */
export async function verifyAuthHeader(request: NextRequest): Promise<AuthPayload | null> {
  try {
    // 1) Authorization header (Bearer token)
    const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization") ?? "";
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token) {
        try {
          const verified: JWTVerifyResult = await jwtVerify(token, SECRET);
          const payload = verified.payload as unknown as AuthPayload;
          if (payload?.userId) return payload;
          // fallthrough to cookie fallback if payload invalid
        } catch {
          // invalid bearer token -> try cookie fallback
        }
      }
    }

    // 2) Cookie fallback on the same request (works inside API routes)
    try {
      const cookieToken = request.cookies.get?.("token")?.value ?? null;
      if (cookieToken) {
        const verified: JWTVerifyResult = await jwtVerify(cookieToken, SECRET);
        const payload = verified.payload as unknown as AuthPayload;
        if (payload?.userId) return payload;
      }
    } catch {
      // cookie invalid or missing
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * generateToken()
 * - Creates a signed JWT string (HS256)
 * - expiresInSeconds default 24h (in seconds)
 */
export async function generateToken(
  userId: string,
  email?: string,
  role?: string,
  expiresInSeconds = 24 * 60 * 60
): Promise<string> {
  const payload: AuthPayload = {
    userId,
    email,
    role,
  };

  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(SECRET);

  return jwt;
}
