import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection } from "../../lib/db"
import { hashPassword, generateToken } from "../../lib/authv0"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = signupSchema.parse(body)

    const users = await getUsersCollection()

    const existingUser = await users.findOne({ email: validated.email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(validated.password)
    const user = {
      email: validated.email,
      password: hashedPassword,
      firstName: validated.firstName,
      lastName: validated.lastName,
      phone: validated.phone || "",
      role: "user",
      approved: false,
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await users.insertOne(user)
    const token = await generateToken(result.insertedId.toString(), validated.email, "user")

    return NextResponse.json(
      {
        token,
        user: {
          id: result.insertedId,
          email: validated.email,
          firstName: validated.firstName,
          lastName: validated.lastName,
          role: "user",
          approved: false,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
