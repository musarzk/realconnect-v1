// app/api/lib/middleware.ts
import { jwtVerify, type JWTPayload } from "jose";
import type { NextRequest } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

/** Auth payload shape expected in our JWTs */
export interface AuthPayload {
  userId: string;
  email: string;
  role: "user" | "agent" | "admin";
  iat: number;
  exp: number;
}

/** Result returned by verifyAuth(...) */
export type VerifyResult =
  | {
      authenticated: true;
      userId: string;
      email: string;
      role: "user" | "agent" | "admin";
    }
  | { authenticated: false; error: string };

/** Runtime type guard to ensure an unknown value matches AuthPayload. */
function isAuthPayload(obj: unknown): obj is AuthPayload {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (typeof o.userId !== "string") return false;
  if (typeof o.email !== "string") return false;
  if (typeof o.iat !== "number") return false;
  if (typeof o.exp !== "number") return false;
  if (typeof o.role !== "string") return false;
  if (!["user", "agent", "admin"].includes(o.role)) return false;
  return true;
}

/**
 * Verify auth token from Authorization header "Bearer <token>"
 * Returns a VerifyResult union that's easy to check.
 */
export async function verifyAuth(request: NextRequest): Promise<VerifyResult> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return { authenticated: false, error: "Missing or malformed authorization header" };
    }

    const token = authHeader.slice(7).trim();
    if (!token) return { authenticated: false, error: "Empty token" };

    const verified = await jwtVerify(token, secret);
    const payload: JWTPayload = verified.payload;

    if (!isAuthPayload(payload)) {
      return { authenticated: false, error: "Token payload invalid or missing required fields" };
    }

    // success
    return {
      authenticated: true,
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch (err: any) {
    // Consider logging a server-side error (err.name / err.message) in dev or to your logs.
    return { authenticated: false, error: "Invalid or expired token" };
  }
}
