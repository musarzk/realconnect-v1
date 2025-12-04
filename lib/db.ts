// lib/db.ts
import { MongoClient, Db, Collection } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "appdb";

if (!MONGODB_URI) {
  throw new Error("❌ Missing environment variable: MONGODB_URI. Add it to .env.local");
}

// ✅ tell TypeScript: now it’s definitely a string
const uri: string = MONGODB_URI;

let cachedClient: MongoClient | null | undefined = null;
let cachedDb: Db | null | undefined = null;

// Add global type for development caching
declare global {
  var _mongoClient: MongoClient | null | undefined;
  var _mongoDb: Db | null | undefined;
}

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  // Check global cache for development
  if (process.env.NODE_ENV === "development") {
    if (global._mongoDb) {
      cachedDb = global._mongoDb;
      cachedClient = global._mongoClient;
      return cachedDb;
    }
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    // Cache in global for development
    if (process.env.NODE_ENV === "development") {
      global._mongoClient = client;
      global._mongoDb = db;
    }

    return db;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    throw new Error("Database connection failed");
  }
}

export async function getDB() {
  return getDb();
}

export async function getPropertiesCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection("properties");
}

export async function getUsersCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection("users");
}

export async function getBookingsCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection("bookings");
}

export async function getMessagesCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection("messages");
}

export async function getNotificationsCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection("notifications");
}
