import { NextResponse, type NextRequest } from "next/server";
import { getUsersCollection, getPropertiesCollection } from "@/lib/db";
import { verifyAuthHeader, getAuthUser } from "@/app/api/lib/auth";

export const dynamic = "force-dynamic";

async function requireAdmin(request: NextRequest) {
  // Try header token first
  let user = await verifyAuthHeader(request);
  if (!user) user = await getAuthUser();
  if (!user || (user as any).role !== "admin") return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const users = await getUsersCollection();
    const properties = await getPropertiesCollection();

    const totalUsers = await users.countDocuments();
    const totalProperties = await properties.countDocuments();
    const pendingApprovals = await properties.countDocuments({ status: "pending" });

    const totalRevenue = 0;

    return NextResponse.json({
      totalProperties,
      totalUsers,
      pendingApprovals,
      totalRevenue,
      monthlyPropertyTrend: 0,
      weeklyUserTrend: 0,
    });
  } catch (err: any) {
    console.error("GET /api/admin/analytics error:", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

