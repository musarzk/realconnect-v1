import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/app/api/lib/db"
import { verifyAuthHeader } from "@/app/api/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthHeader(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (this should be based on your user model)
    // For now, we'll assume all authenticated users can access admin properties
    // You should add proper role-based access control
    const db = await getDB()
    const propertiesCollection = db.collection("properties")

    // Get all properties regardless of approval status (for admin review)
    const properties = await propertiesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // Convert ObjectId to string and format response
    const formattedProperties = properties.map((prop: any) => ({
      _id: prop._id.toString(),
      title: prop.title,
      location: prop.location,
      price: prop.price,
      priceUsd: prop.priceUsd || null,
      status: prop.status || "pending",
      ownerId: prop.ownerId,
      createdAt: prop.createdAt,
      views: prop.views || 0,
      images: prop.images || [],
      verified: prop.verified || false,
    }))

    return NextResponse.json(formattedProperties)
  } catch (error) {
    console.error("Error fetching admin properties:", error)
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}
