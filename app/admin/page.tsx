import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { getAuthUser } from "@/app/api/lib/auth";
import { getUsersCollection, getPropertiesCollection } from "@/lib/db";
import { redirect } from "next/navigation";

// Force dynamic because we are reading cookies and DB
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getAuthUser();

  if (!user || user.role !== "admin") {
    // If not admin, redirect to home or login doesn't matter much as 
    // middleware likely handles this, but double check is good.
    // For now we preserve behavior: show error or redirect.
    // Let's redirect to login if no user, or home if not admin.
    if (!user) redirect("/login");
    redirect("/");
  }

  // Fetch Real Stats from DB
  let platformStats = {
    totalProperties: 0,
    totalUsers: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    monthlyPropertyTrend: 0,
    weeklyUserTrend: 0,
    monthlyRevenueTrend: 0
  };

  try {
    const usersColl = await getUsersCollection();
    const propsColl = await getPropertiesCollection();

    const [totalUsers, totalProperties, pendingApprovals] = await Promise.all([
      usersColl.countDocuments(),
      propsColl.countDocuments(),
      propsColl.countDocuments({ status: "pending" })
    ]);

    platformStats = {
      totalProperties,
      totalUsers,
      pendingApprovals,
      totalRevenue: 425680, // Mock for now as we don't have revenue table
      monthlyPropertyTrend: 0, // Would need complex aggregation
      weeklyUserTrend: 0,      // Would need complex aggregation
      monthlyRevenueTrend: 0   // Would need complex aggregation
    };

  } catch (e) {
    console.error("Admin dashboard stats fetch failed", e);
  }


  // Mock Data for Charts (Replicating API behavior)
  // In a real app, you would fetch this from an "Activity" or "Transactions" collection
  const monthlyData = [
    { month: "Jan", properties: 240, users: 340, revenue: 45000 },
    { month: "Feb", properties: 321, users: 412, revenue: 52000 },
    { month: "Mar", properties: 289, users: 398, revenue: 48000 },
    { month: "Apr", properties: 412, users: 512, revenue: 61000 },
    { month: "May", properties: 501, users: 678, revenue: 78000 },
    { month: "Jun", properties: 645, users: 845, revenue: 95000 },
  ];

  const recentActivity = [
    { _id: "1", type: "user_joined", user: "John Doe", property: "-", time: "2 minutes ago", status: "success" },
    { _id: "2", type: "property_listed", user: "Jane Smith", property: "Modern Apartment", time: "15 minutes ago", status: "success" },
    { _id: "3", type: "property_flagged", user: "System", property: "Beach House", time: "1 hour ago", status: "warning" },
    { _id: "4", type: "transaction", user: "Mike Johnson", property: "Luxury Villa", time: "2 hours ago", status: "success" },
    { _id: "5", type: "property_listed", user: "Sarah Williams", property: "Downtown Penthouse", time: "3 hours ago", status: "success" },
  ] as any[];

  return (
    <AdminDashboardClient
      platformStats={platformStats}
      monthlyData={monthlyData}
      recentActivity={recentActivity}
    />
  );
}
