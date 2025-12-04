import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "../../lib/middleware"

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: authResult.userId,
        email: authResult.email,
        role: authResult.role,
      },
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
