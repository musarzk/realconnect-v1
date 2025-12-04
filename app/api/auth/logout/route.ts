// import { type NextRequest, NextResponse } from "next/server"

// export async function POST(request: NextRequest) {
//   const response = NextResponse.json({ message: "Logged out successfully" })
//   response.cookies.delete("token")
//   return response
// }
// ////////////////////// FROM AUTH-CONTEXT/////////////////////

// app/api/auth/logout/route.ts

// import { NextResponse } from "next/server";

// export async function POST() {
//   const res = NextResponse.json({ success: true });

//   // Clear cookie by setting expired cookie with same name/path
//   res.cookies.set("token", "", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     path: "/",
//     maxAge: 0,
//   });

//   return res;
// }

// ////////////////////// UPDATED ////////////////////


// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Clear cookie named "token" (set expired)
  res.cookies.set("token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

