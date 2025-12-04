// app/api/users/me/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getUsersCollection } from "@/lib/db";
import { getAuthUser } from "@/app/api/lib/auth"; // adjust if your helper path differs

// OPTIONS for preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const users = await getUsersCollection();
    const oid = ObjectId.isValid(auth.userId) ? new ObjectId(auth.userId) : null;
    if (!oid) return NextResponse.json({ error: "Invalid user id" }, { status: 400 });

    const user = await users.findOne({ _id: oid });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const safe = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      phone: user.phone ?? null,
      location: user.location ?? null,
      bio: user.bio ?? null,
      company: user.company ?? null,
      specialization: user.specialization ?? null,
      avatar: user.avatar ?? null,
      role: user.role ?? "user",
    };

    return NextResponse.json({ user: safe });
  } catch (err: any) {
    console.error("GET /api/users/me error:", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    // basic whitelist to prevent arbitrary updates
    const allowed = ["firstName", "lastName", "phone", "location", "bio", "company", "specialization", "avatar"];
    const update: Record<string, any> = { updatedAt: new Date() };
    for (const k of allowed) {
      if (body[k] !== undefined) update[k] = body[k];
    }

    if (update.avatar && !update.avatar.startsWith("http")) {
      try {
        const { uploadToCloudinary } = await import("@/lib/cloudinary");
        update.avatar = await uploadToCloudinary(update.avatar, "dwelas/avatars");
      } catch (error) {
        console.error("Avatar upload failed:", error);
        return NextResponse.json({ error: "Avatar upload failed" }, { status: 500 });
      }
    }

    const users = await getUsersCollection();
    const oid = ObjectId.isValid(auth.userId) ? new ObjectId(auth.userId) : null;
    if (!oid) return NextResponse.json({ error: "Invalid user id" }, { status: 400 });

    // Proceed with update

    // Use updateOne + findOne to avoid driver-specific findOneAndUpdate behavior
    const updateRes = await users.updateOne({ _id: oid }, { $set: update });
    if (!updateRes || (updateRes.matchedCount === 0 && updateRes.modifiedCount === 0)) {
      console.error("PUT /api/users/me: Update matched no documents", { auth, oid, update, updateRes });
      return NextResponse.json({ error: "User not found or update failed" }, { status: 404 });
    }

    const u = await users.findOne({ _id: oid });
    if (!u) {
      console.error("PUT /api/users/me: Document disappeared after update", { auth, oid, update });
      return NextResponse.json({ error: "User not found or update failed" }, { status: 404 });
    }
    const safe = {
      id: u._id?.toString?.() ?? null,
      email: u.email ?? null,
      firstName: u.firstName ?? null,
      lastName: u.lastName ?? null,
      phone: u.phone ?? null,
      location: u.location ?? null,
      bio: u.bio ?? null,
      company: u.company ?? null,
      specialization: u.specialization ?? null,
      avatar: u.avatar ?? null,
    };

    return NextResponse.json({ user: safe }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/users/me error:", err);
    return NextResponse.json({ error: err?.message ?? "Update failed" }, { status: 500 });
  }
}

