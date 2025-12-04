import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection } from "../../lib/db"
import { verifyAuth } from "../../lib/middleware"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const users = await getUsersCollection()
    const user = await users.findOne({ _id: new ObjectId(id) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { password, ...safeUser } = user
    return NextResponse.json(safeUser)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await getUsersCollection()
    const user = await users.findOne({ _id: new ObjectId(id) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check authorization: user can update themselves or admin can update anyone
    if (authResult.userId !== id && authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    // Prevent privilege escalation by not allowing role changes through this endpoint
    delete body.role
    delete body.approved

    const result = await users.updateOne({ _id: new ObjectId(id) }, { $set: body })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 })
    }

    const users = await getUsersCollection()
    const result = await users.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
