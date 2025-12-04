import { type NextRequest, NextResponse } from "next/server"
import { clientPromise } from "../lib/db"

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    await client.db("smartreal").command({ ping: 1 })

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
