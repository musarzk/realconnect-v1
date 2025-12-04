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

    // Return mock activity data for now
    // In a real implementation, you would fetch from an activity log collection
    const activity = [
      { _id: "1", type: "listing_viewed", property: "Modern Apartment", count: 45, time: "2 hours ago" },
      { _id: "2", type: "listing_favorited", property: "Luxury Villa", count: 12, time: "5 hours ago" },
      { _id: "3", type: "inquiry", property: "Downtown Penthouse", count: 3, time: "1 day ago" },
      { _id: "4", type: "listing_viewed", property: "Beach House", count: 28, time: "2 days ago" },
    ]

    return NextResponse.json(activity)
  } catch (error) {
    console.error("Error fetching dashboard activity:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard activity" }, { status: 500 })
  }
}
