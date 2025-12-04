// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/lib/auth";
import User from "@/app/api/lib/models/User";
import { dbConnect } from "@/lib/dbConnect";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ authenticated: false });
    }

    await dbConnect();
    const user = await User.findById(authUser.userId);

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        approved: user.approved, // Ensure this is returned
        phone: user.phone,
        bio: user.bio,
        company: user.company,
        specialization: user.specialization,
        location: user.location,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Error in /api/auth/me:", err);
    return NextResponse.json({ authenticated: false });
  }
}
