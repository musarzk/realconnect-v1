import { type NextRequest, NextResponse } from "next/server"
import { getPropertiesCollection } from "../../lib/dbv0"
import { verifyAuth } from "../../lib/middleware"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const properties = await getPropertiesCollection()
    const property = await properties.findOne({ _id: new ObjectId(params.id) })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Increment views
    await properties.updateOne({ _id: new ObjectId(params.id) }, { $inc: { views: 1 } })

    return NextResponse.json(property)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const properties = await getPropertiesCollection()
    const property = await properties.findOne({ _id: new ObjectId(params.id) })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Check authorization
    if (property.ownerId !== authResult.userId && authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    // Prevent status tampering
    if (authResult.role !== "admin") {
      delete body.status
      delete body.approvedBy
      delete body.approvedAt
    }

    const result = await properties.updateOne({ _id: new ObjectId(params.id) }, { $set: body })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Property updated successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const properties = await getPropertiesCollection()
    const property = await properties.findOne({ _id: new ObjectId(params.id) })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Check authorization
    if (property.ownerId !== authResult.userId && authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const result = await properties.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Property deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 })
  }
}
