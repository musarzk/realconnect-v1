import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/app/api/lib/db"
import { getAuthUser } from "@/app/api/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDB()
    const propertiesCollection = db.collection("properties")

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const status = searchParams.get("status")
    const sort = searchParams.get("sort") || "createdAt"
    const order = searchParams.get("order") === "asc" ? 1 : -1

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build filter - only user's own properties
    const filter: any = {
      ownerId: new ObjectId(user.userId),
    }
    if (status) {
      filter.status = status
    }

    // Fetch properties with pagination
    const [properties, total] = await Promise.all([
      propertiesCollection
        .find(filter)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .toArray(),
      propertiesCollection.countDocuments(filter),
    ])

    // Format response
    const formattedProperties = properties.map((p: any) => ({
      _id: p._id?.toString?.() || "",
      title: p.title || "",
      status: p.status || "pending",
      price: p.price || 0,
      priceUsd: p.priceUsd || null,
      location: p.location || "",
      type: p.type || "",
      listingType: p.listingType || "",
      views: p.views || 0,
      favorites: p.favorites || 0,
      beds: p.beds || 0,
      baths: p.baths || 0,
      sqft: p.sqft || 0,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : "",
      approvedAt: p.approvedAt ? new Date(p.approvedAt).toISOString() : null,
      rejectionReason: p.rejectionReason || null,
    }))

    return NextResponse.json(
      {
        listings: formattedProperties,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching user listings:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch listings",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
