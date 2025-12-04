import { NextResponse, type NextRequest } from "next/server";
import { getPropertiesCollection, getUsersCollection } from "@/lib/db";
import { verifyAuthHeader, getAuthUser } from "@/app/api/lib/auth";

/**
 * Ensure the requesting user is an admin.
 * Uses verifyAuthHeader(request) first; falls back to getAuthUser().
 * Returns the user object if admin, otherwise null.
 */
async function requireAdmin(request: NextRequest) {
  let user: any = await verifyAuthHeader(request);
  if (!user) {
    try {
      user = await getAuthUser();
    } catch {
      user = null;
    }
  }

  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const properties = await getPropertiesCollection();
    const users = await getUsersCollection();

    // Fetch recent properties (latest 10)
    const recentProps = await properties
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()
      .catch(() => []);

    const mapped = recentProps.length
      ? recentProps.map((p: any) => ({
          _id: p._id?.toString?.() ?? String(Math.random()),
          type: "property_listed",
          user: p.ownerId?.toString?.() ?? "unknown",
          property: p.title ?? "Untitled",
          time: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
          status: "success",
        }))
      : // fallback mock activities when DB empty
        [
          { _id: "1", type: "user_joined", user: "John Doe", property: "-", time: "2 minutes ago", status: "success" },
          {
            _id: "2",
            type: "property_listed",
            user: "Jane Smith",
            property: "Modern Apartment",
            time: "15 minutes ago",
            status: "success",
          },
          { _id: "3", type: "property_flagged", user: "System", property: "Beach House", time: "1 hour ago", status: "warning" },
        ];

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error("GET /api/admin/analytics/activity error:", err);
    // Return a safe fallback (empty array) with 200 so front-end can handle gracefully.
    return NextResponse.json([], { status: 200 });
  }
}
