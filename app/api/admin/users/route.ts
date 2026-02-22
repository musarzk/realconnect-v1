import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/app/api/lib/db"
import { getAuthUser } from "@/app/api/lib/auth"
import { ObjectId } from "mongodb"
import { UserRoleUpdateSchema, UserApprovalSchema, UserSuspensionSchema } from "@/app/api/lib/schemavalidation/user-schema"
import { z } from "zod"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - admin access required" }, { status: 401 })
    }

    const db = await getDB()
    const usersCollection = db.collection("users")

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role")
    const sort = searchParams.get("sort") || "createdAt"
    const order = searchParams.get("order") === "asc" ? 1 : -1

    // Build filter
    const filter: any = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }
    if (role && role !== "all") {
      filter.role = role
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch users with pagination
    const [users, total] = await Promise.all([
      usersCollection
        .find(filter)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .toArray(),
      usersCollection.countDocuments(filter),
    ])

    // Fetch property counts for these users
    const propertiesCollection = db.collection("properties")
    const userIds = users.map(u => u._id)

    // Aggregate counts by ownerId
    const listingCounts = await propertiesCollection.aggregate([
      { $match: { ownerId: { $in: userIds } } },
      { $group: { _id: "$ownerId", count: { $sum: 1 } } }
    ]).toArray()

    const countMap = new Map(listingCounts.map(item => [item._id.toString(), item.count]))

    // Format response
    const formattedUsers = users.map((u: any) => ({
      _id: u._id?.toString?.() || "",
      name: u.name || "",
      firstName: u.firstName || u.name?.split(" ")[0] || "",
      lastName: u.lastName || u.name?.split(" ").slice(1).join(" ") || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || "user",
      listings: countMap.get(u._id.toString()) || 0,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : "",
      lastLogin: u.lastLogin ? new Date(u.lastLogin).toISOString() : null,
      approved: u.approved !== false, // Default true if not specified
      suspendedAt: u.suspendedAt ? new Date(u.suspendedAt).toISOString() : null,
    }))

    return NextResponse.json(
      {
        users: formattedUsers,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        currentUserId: user.userId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - admin access required" }, { status: 401 })
    }

    const db = await getDB()
    const usersCollection = db.collection("users")

    // Parse and validate body
    const body = await request.json().catch(() => ({}))
    console.log("[PATCH /api/admin/users] Request body:", body)

    // Validate userId
    if (!body.userId || typeof body.userId !== "string") {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 })
    }

    const oid = ObjectId.isValid(body.userId) ? new ObjectId(body.userId) : null
    console.log("[PATCH /api/admin/users] userId:", body.userId, "ObjectId valid:", !!oid, "ObjectId:", oid)
    if (!oid) {
      return NextResponse.json({ error: "Invalid userId format" }, { status: 400 })
    }

    // Prevent users from modifying their own account
    const currentUserId = user.userId
    const targetUserId = body.userId
    console.log("[PATCH /api/admin/users] Current user ID:", currentUserId, "Target user ID:", targetUserId)

    if (currentUserId === targetUserId) {
      console.log("[PATCH /api/admin/users] User attempting to modify their own account - BLOCKED")
      return NextResponse.json({
        error: "Cannot modify your own account. Please ask another administrator to make these changes."
      }, { status: 403 })
    }

    // Validate and extract update fields
    const updateData: any = { updatedAt: new Date() }

    if (body.role !== undefined) {
      try {
        const validated = UserRoleUpdateSchema.parse({ role: body.role })
        updateData.role = validated.role
      } catch (err) {
        if (err instanceof z.ZodError) {
          return NextResponse.json({ error: "Invalid role", details: err.errors }, { status: 400 })
        }
      }
    }

    if (body.approved !== undefined) {
      try {
        const validated = UserApprovalSchema.parse({ approved: body.approved })
        updateData.approved = validated.approved
      } catch (err) {
        if (err instanceof z.ZodError) {
          return NextResponse.json({ error: "Invalid approved value", details: err.errors }, { status: 400 })
        }
      }
    }

    if (body.suspended !== undefined) {
      try {
        const validated = UserSuspensionSchema.parse({ suspended: body.suspended })
        if (validated.suspended) {
          updateData.suspendedAt = new Date()
        } else {
          updateData.suspendedAt = null
        }
      } catch (err) {
        if (err instanceof z.ZodError) {
          return NextResponse.json({ error: "Invalid suspended value", details: err.errors }, { status: 400 })
        }
      }
    }

    console.log("[PATCH /api/admin/users] Update data:", updateData)

    // Check if user exists first
    const existingUser = await usersCollection.findOne({ _id: oid })
    console.log("[PATCH /api/admin/users] Existing user found:", !!existingUser, existingUser ? `ID: ${existingUser._id}` : "null")

    // Update user
    // In newer MongoDB drivers, findOneAndUpdate returns the document directly by default
    const updatedUser = await usersCollection.findOneAndUpdate(
      { _id: oid },
      { $set: updateData },
      { returnDocument: "after" }
    )

    console.log("[PATCH /api/admin/users] findOneAndUpdate result:", updatedUser)

    if (!updatedUser) {
      console.log("[PATCH /api/admin/users] User not found after update")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[PATCH /api/admin/users] Update successful, user:", updatedUser._id)

    return NextResponse.json(
      {
        success: true,
        user: {
          _id: updatedUser._id?.toString?.() || "",
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          approved: updatedUser.approved,
          suspendedAt: updatedUser.suspendedAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      {
        error: "Failed to update user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - admin access required" }, { status: 401 })
    }

    const db = await getDB()
    const usersCollection = db.collection("users")

    // Parse body for userId
    const body = await request.json().catch(() => ({}))
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const oid = ObjectId.isValid(userId) ? new ObjectId(userId) : null
    if (!oid) {
      return NextResponse.json({ error: "Invalid userId format" }, { status: 400 })
    }

    // Prevent deleting own account
    if (user.userId === userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 403 })
    }

    // Prevent deleting the last admin
    const adminCount = await usersCollection.countDocuments({ role: "admin" })
    const targetUser = await usersCollection.findOne({ _id: oid })

    if (targetUser?.role === "admin" && adminCount <= 1) {
      return NextResponse.json({ error: "Cannot delete the last admin user" }, { status: 403 })
    }

    // Delete user
    const result = await usersCollection.deleteOne({ _id: oid })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      {
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
