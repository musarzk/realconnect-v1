"use server"

import { getBookingsCollection, getPropertiesCollection } from "@/lib/db"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { ObjectId } from "mongodb"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload as any
  } catch (error) {
    return null
  }
}

export async function createBooking(propertyId: string, bookingData: any) {
  try {
    const user = await getAuthUser()
    if (!user) throw new Error("Unauthorized")

    const bookings = await getBookingsCollection()
    const properties = await getPropertiesCollection()

    // Verify property exists
    const property = await properties.findOne({ _id: new ObjectId(propertyId) })
    if (!property) throw new Error("Property not found")

    const booking = {
      ...bookingData,
      propertyId,
      userId: user.userId,
      createdAt: new Date(),
      status: "pending",
    }

    const result = await bookings.insertOne(booking)
    return { success: true, bookingId: result.insertedId }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getUserBookings() {
  try {
    const user = await getAuthUser()
    if (!user) throw new Error("Unauthorized")

    const bookings = await getBookingsCollection()
    const userBookings = await bookings.find({ userId: user.userId }).sort({ createdAt: -1 }).toArray()

    return { success: true, bookings: userBookings }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const user = await getAuthUser()
    if (!user) throw new Error("Unauthorized")

    const bookings = await getBookingsCollection()
    const booking = await bookings.findOne({ _id: new ObjectId(bookingId) })

    if (!booking) throw new Error("Booking not found")
    if (booking.userId !== user.userId && user.role !== "admin") {
      throw new Error("Forbidden")
    }

    await bookings.updateOne({ _id: new ObjectId(bookingId) }, { $set: { status: "cancelled" } })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
