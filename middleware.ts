// import { type NextRequest, NextResponse } from "next/server"
// import { jwtVerify } from "jose"

// const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")



// const protectedRoutes = ["/dashboard", "/admin",  "/messages", "/list-property", "/investor-portal"]
// const authRoutes = ["/login", "/signup"]

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl
//   const token = request.cookies.get("token")?.value

//   // Check if route is protected
//   const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
//   const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

//   if (isAuthRoute && token) {
//     try {
//       await jwtVerify(token, secret)
//       // User is logged in, redirect to dashboard
//       return NextResponse.redirect(new URL("/dashboard", request.url))
//     } catch {
//       // Token is invalid, continue to auth page
//       return NextResponse.next()
//     }
//   }

//   if (isProtectedRoute && !token) {
//     return NextResponse.redirect(new URL("/login", request.url))
//   }

//   if (isProtectedRoute && token) {
//     try {
//       await jwtVerify(token, secret)
//       return NextResponse.next()
//     } catch {
//       return NextResponse.redirect(new URL("/login", request.url))
//     }
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// }


// //////////////////////// UPDATED FOR PROTECTED LINKS/////////////////////


// /middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Middleware:
 * - Verifies token cookie when present to read `role` (admin | user | agent).
 * - Redirects unauthenticated users away from protected pages to /login.
 * - Redirects authenticated users away from /login /register to their role dashboard:
 *    admin -> /admin, others -> /dashboard
 *
 * Notes:
 * - Uses cookie "token" (httpOnly) which is what your login/register API sets.
 * - If jwtVerify fails, it falls back to presence-only behavior.
 */

const SECRET = process.env.JWT_SECRET ? new TextEncoder().encode(process.env.JWT_SECRET) : null;

// Paths we consider auth pages — authenticated users should not view
const authPages = ["/login", "/signin", "/register", "/signup"];

// Protected pages that require authentication
const protectedPaths = ["/dashboard", "/list-property", "/account", "/profile", "/settings", "/admin"];

async function getRoleFromToken(token?: string) {
  if (!token || !SECRET) return null;
  try {
    const verified = await jwtVerify(token, SECRET);
    const payload = verified.payload as Record<string, any>;
    // normalize role (may be string)
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // allow internals & api through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const hasToken = Boolean(token);

  // try to obtain role (best-effort)
  let role: string | null = null;
  if (hasToken) {
    role = await getRoleFromToken(token).catch(() => null);
  }

  // 1) Redirect authenticated users away from auth pages to their dashboard
  if (hasToken && authPages.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const dest = role === "admin" ? "/admin" : "/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = dest;
    return NextResponse.redirect(url);
  }

  // 2) Protect selected pages: if not logged-in -> to /login
  const needsAuth = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (needsAuth && !hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // otherwise continue
  return NextResponse.next();
}

// default export to satisfy Next if it expects a default
export default middleware;

/**
 * Only run middleware on these routes — more efficient than running everywhere
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/list-property/:path*",
    "/account/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/login",
    "/signin",
    "/register",
    "/signup",
  ],
};
