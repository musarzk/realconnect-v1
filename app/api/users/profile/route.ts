import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/app/api/lib/db"
import { getAuthUser } from "@/app/api/lib/auth"
import { ObjectId } from "mongodb"
import { UpdateProfileSchema } from "@/app/api/lib/schemavalidation/user-schema"
import { z } from "zod"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDB()
    const usersCollection = db.collection("users")

    const userDoc = await usersCollection.findOne({ _id: new ObjectId(user.userId) })

    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        _id: userDoc._id?.toString?.() || "",
        name: userDoc.name || "",
        email: userDoc.email || "",
        phone: userDoc.phone || "",
        bio: userDoc.bio || "",
        avatar: userDoc.avatar || null,
        role: userDoc.role || "user",
        createdAt: userDoc.createdAt ? new Date(userDoc.createdAt).toISOString() : "",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch profile",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDB()
    const usersCollection = db.collection("users")

    // Parse and validate body
    const body = await request.json().catch(() => ({}))

    // Use Zod schema for validation
    const parseResult = UpdateProfileSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.errors },
        { status: 400 }
      )
    }

    const validated = parseResult.data

    // Build update object
    const updateData: any = { updatedAt: new Date() }
    if (validated.firstName !== undefined) updateData.firstName = validated.firstName.trim()
    if (validated.lastName !== undefined) updateData.lastName = validated.lastName.trim()
    if (validated.email !== undefined) updateData.email = validated.email.toLowerCase().trim()
    if (validated.phone !== undefined) updateData.phone = validated.phone?.trim() || null
    if (validated.bio !== undefined) updateData.bio = validated.bio?.trim() || null

    if (validated.avatar !== undefined) {
      if (validated.avatar && !validated.avatar.startsWith("http")) {
        try {
          updateData.avatar = await uploadToCloudinary(validated.avatar, "dwelas/avatars")
        } catch (error) {
          console.error("Avatar upload failed:", error)
          // Continue without updating avatar or return error?
          // Let's return error to inform user
          return NextResponse.json({ error: "Avatar upload failed" }, { status: 500 })
        }
      } else {
        updateData.avatar = validated.avatar
      }
    }
    if (validated.location !== undefined) updateData.location = validated.location?.trim() || null
    if (validated.company !== undefined) updateData.company = validated.company?.trim() || null
    if (validated.specialization !== undefined) updateData.specialization = validated.specialization?.trim() || null

    // Check if email already exists (for another user)
    if (validated.email) {
      const existingUser = await usersCollection.findOne({
        email: validated.email.toLowerCase(),
        _id: { $ne: new ObjectId(user.userId) },
      })
      if (existingUser) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      }
    }

    // Update user
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(user.userId) },
      { $set: updateData },
      { returnDocument: "after" }
    )

    if (!result || !result.value) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          _id: result.value._id?.toString?.() || "",
          firstName: result.value.firstName || "",
          lastName: result.value.lastName || "",
          email: result.value.email || "",
          phone: result.value.phone || null,
          bio: result.value.bio || null,
          avatar: result.value.avatar || null,
          location: result.value.location || null,
          role: result.value.role || "user",
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      {
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
