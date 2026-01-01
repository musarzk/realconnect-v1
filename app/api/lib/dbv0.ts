// app/api/lib/dbv0.ts
import clientPromise, { getDatabase } from "../../../lib/mongodb"
import type { Db, Collection } from "mongodb"

/**
 * Optionally returns the active database instance.
 * Reuses getDatabase() from mongodb.ts so the DB name is not hardcoded here.
 */
export async function getDb(): Promise<Db> {
  return await getDatabase()
}

/**
 * Collection accessors
 * Each returns a typed Collection<T> — you can later define interfaces for each entity type.
 * Example: return db.collection<Property>("properties")
 */

export async function getPropertiesCollection(): Promise<Collection> {
  const db = await getDb()
  return db.collection("properties")
}

export async function getUsersCollection(): Promise<Collection> {
  const db = await getDb()
  return db.collection("users")
}

export async function getBookingsCollection(): Promise<Collection> {
  const db = await getDb()
  return db.collection("bookings")
}

export async function getMessagesCollection(): Promise<Collection> {
  const db = await getDb()
  return db.collection("messages")
}

export async function getNotificationsCollection(): Promise<Collection> {
  const db = await getDb()
  return db.collection("notifications")
}
