import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/app/api/lib/db"
import { verifyAuthHeader } from "@/app/api/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthHeader(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return mock inquiries data for now
    const inquiriesData = [
      { name: "Serious Inquiries", value: 45, fill: "#3b82f6" },
      { name: "General Inquiries", value: 32, fill: "#8b5cf6" },
      { name: "Tour Requests", value: 28, fill: "#ec4899" },
    ]

    return NextResponse.json(inquiriesData)
  } catch (error) {
    console.error("Error fetching inquiries analytics:", error)
    return NextResponse.json({ error: "Failed to fetch inquiries analytics" }, { status: 500 })
  }
}
