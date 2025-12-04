"use server"

import { getUsersCollection } from "@/lib/db"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { ObjectId } from "mongodb"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload as any
  } catch (error) {
    return null
  }
}

export async function updateUserProfile(userId: string, data: any) {
  try {
    const user = await getAuthUser()
    if (!user || (user.userId !== userId && user.role !== "admin")) {
      throw new Error("Unauthorized")
    }

    const users = await getUsersCollection()
    // Prevent privilege escalation
    delete data.role
    delete data.approved

    await users.updateOne({ _id: new ObjectId(userId) }, { $set: data })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function approveUser(userId: string, approved: boolean) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "admin") throw new Error("Admin only")

    const users = await getUsersCollection()
    await users.updateOne({ _id: new ObjectId(userId) }, { $set: { approved } })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function assignUserRole(userId: string, role: "user" | "agent" | "admin") {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "admin") throw new Error("Admin only")

    const users = await getUsersCollection()
    await users.updateOne({ _id: new ObjectId(userId) }, { $set: { role } })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteUser(userId: string) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "admin") throw new Error("Admin only")

    const users = await getUsersCollection()
    await users.deleteOne({ _id: new ObjectId(userId) })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
