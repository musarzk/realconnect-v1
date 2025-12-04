import { type NextRequest, NextResponse } from "next/server"
import { getNotificationsCollection } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const notifications = await getNotificationsCollection()

    const results = await notifications.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()

    const total = await notifications.countDocuments({ userId })
    const unread = await notifications.countDocuments({ userId, read: false })

    return NextResponse.json({
      notifications: results,
      unread,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const notifications = await getNotificationsCollection()

    const notification = {
      ...body,
      createdAt: new Date(),
      read: false,
    }

    const result = await notifications.insertOne(notification)
    return NextResponse.json({ id: result.insertedId, ...notification }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationIds, read } = body
    const notifications = await getNotificationsCollection()

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json({ error: "notificationIds must be an array" }, { status: 400 })
    }

    const objectIds = notificationIds.map((id) => new (require("mongodb").ObjectId)(id))

    await notifications.updateMany({ _id: { $in: objectIds } }, { $set: { read } })

    return NextResponse.json({ message: "Notifications updated" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}
