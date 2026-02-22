import { type NextRequest, NextResponse } from "next/server"
import { getPropertiesCollection } from "../lib/dbv0"
import { verifyAuth } from "../lib/middleware"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get("location")
    const type = searchParams.get("type")
    const listingType = searchParams.get("listingType")
    const priceMin = searchParams.get("priceMin")
    const priceMax = searchParams.get("priceMax")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    const properties = await getPropertiesCollection()
    const query: any = { status: "approved" }

    if (location) query.location = { $regex: location, $options: "i" }
    if (type && type !== "all") query.type = type
    if (listingType && listingType !== "all") query.listingType = listingType
    if (priceMin || priceMax) {
      query.price = {}
      if (priceMin) query.price.$gte = Number.parseInt(priceMin)
      if (priceMax) query.price.$lte = Number.parseInt(priceMax)
    }

    const results = await properties.find(query).skip(skip).limit(limit).toArray()

    const total = await properties.countDocuments(query)

    return NextResponse.json({
      properties: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    if (!body.listingType || !["sale", "rent"].includes(body.listingType)) {
      return NextResponse.json({ error: "Invalid listing type. Must be 'sale' or 'rent'" }, { status: 400 })
    }

    const properties = await getPropertiesCollection()

    const property = {
      ...body,
      createdAt: new Date(),
      status: "pending",
      views: 0,
      favorites: 0,
      approvedAt: null,
      rejectionReason: null,
      approvedBy: null,
      ownerId: authResult.userId,
    }

    const result = await properties.insertOne(property)
    return NextResponse.json({ id: result.insertedId, ...property }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
  }
}
