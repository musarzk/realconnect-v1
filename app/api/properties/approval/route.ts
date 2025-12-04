import { type NextRequest, NextResponse } from "next/server"
import { getPropertiesCollection } from "../../lib/db"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, action, rejectionReason, adminId } = body

    if (!propertyId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    const properties = await getPropertiesCollection()

    const updateData =
      action === "approve"
        ? {
            status: "approved",
            approvedAt: new Date(),
            approvedBy: adminId,
            rejectionReason: null,
          }
        : {
            status: "rejected",
            rejectionReason: rejectionReason || "Rejected by admin",
            approvedAt: null,
            approvedBy: null,
          }

    const result = await properties.updateOne({ _id: new ObjectId(propertyId) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: `Property ${action}ed successfully`,
      status: updateData.status,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update property status" }, { status: 500 })
  }
}
