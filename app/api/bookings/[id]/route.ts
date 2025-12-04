// app/api/bookings/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getBookingsCollection } from "../../lib/db"
import { verifyAuth } from "../../lib/middleware"
import { sendEmail } from "@/lib/email"

/**
 * Update booking status (admin only)
 * Expected body: { status: "confirmed" | "cancelled" | "completed" }
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const { status } = await request.json()
    const allowed = ["confirmed", "cancelled", "completed"] as const
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const bookings = await getBookingsCollection()
    const result = await bookings.updateOne(
      { _id: new (await import("mongodb")).ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    )
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Notify user via email if email is stored in booking (assume booking.userEmail)
    const booking = await bookings.findOne({ _id: new (await import("mongodb")).ObjectId(id) })
    if (booking?.userEmail) {
      const subject = `Your booking status changed to ${status}`
      const html = `<p>Hello,</p><p>Your booking for property ${booking.propertyId} is now <strong>${status}</strong>.</p>`
      await sendEmail(booking.userEmail, subject, html)
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
