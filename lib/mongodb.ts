// app/api/lib/mongodb.ts
import { MongoClient, type Db, type MongoClientOptions } from "mongodb"

/**
 * Ensure the environment variable exists — otherwise fail early.
 * This avoids `string | undefined` TypeScript issues later.
 */
if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local (MONGODB_URI)")
}

/**
 * URI is now guaranteed (we threw if missing) so assert type to string.
 * If you prefer no assertion, you can inline process.env checks where used.
 */
const uri = process.env.MONGODB_URI as string

/**
 * Optional MongoClient options. Add tls/ssl, poolSize, etc. here if needed.
 * Typing helps avoid "any" creeping in.
 */
const options: MongoClientOptions = {}

/**
 * Use a global cache for the MongoClient promise in development so HMR
 * doesn't create a new connection on every reload (Next.js recommended pattern).
 */
declare global {
  // attach to globalThis for dev hot-reload caching
  var _mongoClientPromise: Promise<MongoClient> | null | undefined
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // Use global cache in dev to avoid exhausting connections
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise!
} else {
  // In production create a single client instance
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

/**
 * Export the connected client promise for other modules to reuse.
 * Example import: import clientPromise from "@/app/api/lib/mongodb"
 */
export default clientPromise

/**
 * getDatabase
 * - returns the selected database object
 * - uses MONGODB_DBNAME environment variable if provided (recommended),
 *   otherwise falls back to "smartreal"
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  // Try both MONGODB_DBNAME and MONGODB_DB for compatibility
  const dbName = process.env.MONGODB_DBNAME ?? process.env.MONGODB_DB ?? "smartreal"
  return client.db(dbName)
}
