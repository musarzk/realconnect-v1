import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/app/api/lib/db"
import { getAuthUser } from "@/app/api/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      console.warn("Reports: No authenticated user")
      return NextResponse.json({ error: "Unauthorized - authentication required" }, { status: 401 })
    }
    if (user.role !== "admin") {
      console.warn(`Reports: User ${user.userId} attempted access with role: ${user.role}`)
      return NextResponse.json({ error: "Forbidden - admin access required" }, { status: 403 })
    }

    const db = await getDB()
    const propertiesCollection = db.collection("properties")
    const usersCollection = db.collection("users")
    const bookingsCollection = db.collection("bookings")

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const status = searchParams.get("status")

    // Build date filter
    const dateFilter: any = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        dateFilter.createdAt.$lte = end
      }
    }

    // Build property filter
    const propertyFilter: any = { ...dateFilter }
    if (status) propertyFilter.status = status

    // Fetch comprehensive data
    const [allProperties, allUsers, allBookings, propertyStats, userStats, revenueData] = await Promise.all([
      propertiesCollection.find(propertyFilter).toArray(),
      usersCollection.find().toArray(),
      bookingsCollection.find(dateFilter).toArray(),
      propertiesCollection.aggregate([
        { $match: propertyFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            avgPrice: { $avg: "$price" },
            totalValue: { $sum: "$price" },
          },
        },
      ]).toArray(),
      usersCollection.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: [{ $ne: ["$lastLogin", null] }, 1, 0] } },
          },
        },
      ]).toArray(),
      propertiesCollection.aggregate([
        { $match: propertyFilter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: { $multiply: ["$price", 0.05] } }, // 5% commission
            properties: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]).toArray(),
    ])

    // Calculate summary statistics
    const totalProperties = allProperties.length
    const totalApproved = allProperties.filter((p) => p.status === "approved").length
    const totalPending = allProperties.filter((p) => p.status === "pending").length
    const totalRejected = allProperties.filter((p) => p.status === "rejected").length

    const totalRevenue = allProperties.reduce((sum: number, p: any) => sum + (Number(p.price) || 0) * 0.05, 0)
    const avgPrice =
      totalProperties > 0
        ? allProperties.reduce((sum: number, p: any) => sum + (Number(p.price) || 0), 0) / totalProperties
        : 0

    // Property breakdown by type
    const propertyByType = await propertiesCollection
      .aggregate([
        { $match: propertyFilter },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            avgPrice: { $avg: "$price" },
          },
        },
      ])
      .toArray()

    // Property breakdown by listing type
    const propertyByListingType = await propertiesCollection
      .aggregate([
        { $match: propertyFilter },
        {
          $group: {
            _id: "$listingType",
            count: { $sum: 1 },
            avgPrice: { $avg: "$price" },
          },
        },
      ])
      .toArray()

    // Top agents (owners) by property count
    const topAgents = await propertiesCollection
      .aggregate([
        { $match: propertyFilter },
        {
          $group: {
            _id: "$ownerId",
            propertyCount: { $sum: 1 },
            totalValue: { $sum: "$price" },
            avgPrice: { $avg: "$price" },
          },
        },
        { $sort: { propertyCount: -1 } },
        { $limit: 10 },
      ])
      .toArray()

    // Format properties for export
    const formattedProperties = allProperties.map((p: any) => ({
      _id: p._id?.toString?.() || "",
      title: p.title || "",
      type: p.type || "",
      listingType: p.listingType || "",
      location: p.location || "",
      price: p.price || 0,
      priceUsd: p.priceUsd || null,
      status: p.status || "",
      beds: p.beds || 0,
      baths: p.baths || 0,
      sqft: p.sqft || 0,
      ownerId: p.ownerId?.toString?.() || p.ownerId || "",
      views: p.views || 0,
      favorites: p.favorites || 0,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : "",
      approvedAt: p.approvedAt ? new Date(p.approvedAt).toISOString() : null,
    }))

    // Format bookings for export
    const formattedBookings = allBookings
      .slice(0, 1000) // Limit to 1000 for export
      .map((b: any) => ({
        _id: b._id?.toString?.() || "",
        propertyId: b.propertyId?.toString?.() || b.propertyId || "",
        userId: b.userId?.toString?.() || b.userId || "",
        checkInDate: b.checkInDate ? new Date(b.checkInDate).toISOString() : "",
        checkOutDate: b.checkOutDate ? new Date(b.checkOutDate).toISOString() : "",
        totalPrice: b.totalPrice || 0,
        status: b.status || "pending",
        createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : "",
      }))

    return NextResponse.json({
      summary: {
        totalProperties,
        totalApproved,
        totalPending,
        totalRejected,
        totalRevenue: Math.round(totalRevenue),
        avgPrice: Math.round(avgPrice),
        totalUsers: allUsers.length,
        totalBookings: allBookings.length,
      },
      breakdown: {
        byStatus: propertyStats,
        byType: propertyByType,
        byListingType: propertyByListingType,
        topAgents,
      },
      revenueTimeline: revenueData,
      properties: formattedProperties,
      bookings: formattedBookings,
    })
  } catch (error: any) {
    console.error("Error fetching reports:", error?.message || error)
    return NextResponse.json(
      { 
        error: "Failed to fetch reports",
        detail: process.env.NODE_ENV === "development" ? error?.message : undefined 
      }, 
      { status: 500 }
    )
  }
}
