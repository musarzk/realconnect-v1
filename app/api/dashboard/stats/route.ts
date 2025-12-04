import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/app/api/lib/db"
import { verifyAuthHeader } from "@/app/api/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthHeader(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDB()
    const propertiesCollection = db.collection("properties")

    // Get user's properties count
    const activeListings = await propertiesCollection.countDocuments({
      ownerId: user.userId,
      status: "approved",
    })

    // Calculate stats (would come from views collection in a real app)
    const totalViews = activeListings * 237 // Mock calculation
    const totalFavorites = activeListings * 13 // Mock calculation
    const estimatedRevenue = activeListings * 12000000 // Mock calculation (NGN)

    return NextResponse.json({
      activeListings,
      totalViews,
      totalFavorites,
      estimatedRevenue: Math.round(estimatedRevenue),
      monthlyListingTrend: 2,
      weeklyViewTrend: 428,
      monthlyFavoriteTrend: 32,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
