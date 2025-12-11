import { DashboardOverviewClient } from "@/components/dashboard/dashboard-overview-client";
import { getAuthUser } from "@/app/api/lib/auth";
import { getPropertiesCollection } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch stats from DB
  let activeListings = 0;

  try {
    const propsColl = await getPropertiesCollection();
    activeListings = await propsColl.countDocuments({
      ownerId: user.userId, // Ensure userId specific count
      status: "approved"
    });
  } catch (error) {
    console.error("Dashboard stats fetch error", error);
  }

  // Mock calculated stats (same logic as API)
  const stats = {
    activeListings,
    totalViews: activeListings * 237,
    totalFavorites: activeListings * 13,
    estimatedRevenue: activeListings * 12000000,
    monthlyListingTrend: 2,
    weeklyViewTrend: 428,
    monthlyFavoriteTrend: 32,
  };

  const recentActivity = [
    { _id: "1", type: "listing_viewed", property: "Modern Apartment", count: 45, time: "2 hours ago" },
    { _id: "2", type: "listing_favorited", property: "Luxury Villa", count: 12, time: "5 hours ago" },
    { _id: "3", type: "inquiry", property: "Downtown Penthouse", count: 3, time: "1 day ago" },
    { _id: "4", type: "listing_viewed", property: "Beach House", count: 28, time: "2 days ago" },
  ];

  return (
    <DashboardOverviewClient
      stats={stats}
      recentActivity={recentActivity}
      userRole={user.role}
    />
  );
}
