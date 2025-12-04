import { type NextRequest, NextResponse } from "next/server"
import { getBookingsCollection } from "../lib/db"
import { verifyAuth } from "../lib/middleware"
import { sendEmail } from "../../../lib/email"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const bookings = await getBookingsCollection()

    const booking = {
      ...body,
      createdAt: new Date(),
      status: "pending",
      userId: authResult.userId,
    }

    const result = await bookings.insertOne(booking)
    // Send email notifications
    const userEmail = authResult.email || ""
    const adminEmail = process.env.ADMIN_EMAIL || ""
    const subject = `New Booking Request for Property ${booking.propertyId}`
    const html = `<p>User ${authResult.email || "User"} has requested a booking.</p><p>Details: ${JSON.stringify(booking)}</p>`
    if (userEmail) await sendEmail(userEmail, subject, html)
    if (adminEmail) await sendEmail(adminEmail, subject, html)

    return NextResponse.json({ id: result.insertedId, ...booking }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get("propertyId")
    const userId = searchParams.get("userId")

    const bookings = await getBookingsCollection()
    const query: any = {}

    if (propertyId) query.propertyId = propertyId
    if (authResult.role !== "admin") {
      query.userId = authResult.userId
    } else if (userId) {
      query.userId = userId
    }

    const results = await bookings.find(query).toArray()
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
    }

    const bookings = await getBookingsCollection()
    
    let queryId: any = id
    try {
      if (ObjectId.isValid(id)) {
        queryId = new ObjectId(id)
      }
    } catch (e) {
      // ignore
    }

    const result = await bookings.updateOne(
      { _id: queryId },
      { $set: { status, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Send status update email
    // Fetch booking to get user email (if we had it stored or related user)
    // For now, skip email or implement later

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
