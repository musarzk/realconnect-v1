import { type NextRequest, NextResponse } from "next/server"
import { getPropertiesCollection } from "../../lib/db"

export async function GET(request: NextRequest) {
  try {
    const properties = await getPropertiesCollection()

    const stats = await properties
      .aggregate([
        {
          $group: {
            _id: null,
            totalProperties: { $sum: 1 },
            totalViews: { $sum: "$views" },
            totalFavorites: { $sum: "$favorites" },
            avgPrice: { $avg: "$price" },
            activeListings: {
              $sum: {
                $cond: [{ $eq: ["$status", "active"] }, 1, 0],
              },
            },
          },
        },
      ])
      .toArray()

    const propertyStats = stats[0] || {}

    return NextResponse.json(propertyStats)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
