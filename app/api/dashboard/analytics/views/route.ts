import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/app/api/lib/db"
import { verifyAuthHeader } from "@/app/api/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthHeader(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return mock views data for now
    const viewsData = [
      { month: "Jan", views: 240, favorites: 24 },
      { month: "Feb", views: 421, favorites: 42 },
      { month: "Mar", views: 356, favorites: 35 },
      { month: "Apr", views: 512, favorites: 51 },
      { month: "May", views: 678, favorites: 68 },
      { month: "Jun", views: 845, favorites: 84 },
    ]

    return NextResponse.json(viewsData)
  } catch (error) {
    console.error("Error fetching views analytics:", error)
    return NextResponse.json({ error: "Failed to fetch views analytics" }, { status: 500 })
  }
}
