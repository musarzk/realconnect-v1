import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "../lib/db"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const portfolios = db.collection("investor_portfolios")

    const results = await portfolios.find({}).sort({ createdAt: -1 }).limit(100).toArray()

    return NextResponse.json({ portfolios: results })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch portfolios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, budget, expectedROI, riskProfile, preferences } = body

    const db = await getDatabase()
    const portfolios = db.collection("investor_portfolios")

    const portfolio = {
      userId,
      name,
      budget,
      expectedROI,
      riskProfile,
      preferences,
      properties: [],
      totalValue: 0,
      currentROI: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await portfolios.insertOne(portfolio)

    return NextResponse.json({ id: result.insertedId, ...portfolio }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create portfolio" }, { status: 500 })
  }
}
