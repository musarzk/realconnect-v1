// app/api/auth/login/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUsersCollection } from "@/lib/db";
import { comparePassword, generateToken } from "@/app/api/lib/authv0"; // <-- imports we just provided

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.parse(body);

    const email = parsed.email.toLowerCase();

    const users = await getUsersCollection();
    if (!users) {
      console.error("[/api/auth/login] DB collection not available");
      return NextResponse.json({ error: "Server DB error" }, { status: 500 });
    }

    // case-insensitive lookup
    const user = await users.findOne({ email: { $regex: `^${email}$`, $options: "i" } });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await comparePassword(parsed.password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check for suspension
    if (user.suspendedAt) {
      return NextResponse.json({ error: "Your account is on suspension. Contact the admin." }, { status: 403 });
    }

    // Check for approval (pending or rejected)
    if (user.approved === false) {
      return NextResponse.json({ error: "Your account is pending approval or has been rejected. Please contact support." }, { status: 403 });
    }

    // generate token (signature: userId, email, role)
    const token = await generateToken(user._id!.toString(), user.email, user.role);

    const safeUser = {
      id: user._id?.toString ? user._id.toString() : user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role ?? "user",
      approved: user.approved ?? false,
      favorites: user.favorites ?? [],
    };

    const res = NextResponse.json({ token, user: safeUser }, { status: 200 });

    // set httpOnly cookie so server helpers (getAuthUser) can read it from cookies()
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 1 day
    });

    return res;
  } catch (err: any) {
    if (err?.name === "ZodError" || err instanceof z.ZodError) {
      const msg = (err?.errors && err.errors[0]?.message) || "Invalid input";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error("[/api/auth/login] unexpected error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
