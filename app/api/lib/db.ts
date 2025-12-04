// app/api/lib/db.ts
import { MongoClient, MongoClientOptions, Db, Collection } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "Realbase";

if (!uri) {
  // fail loudly during startup in dev so you know env is missing
  throw new Error("❌ Missing environment variable: MONGODB_URI");
}

// Connection options — keep them conservative for dev/prod
const options: MongoClientOptions = {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  // tune pool size via env in production if needed
};

// Cache client across HMR (Next.js dev). This file MUST only be imported on the server.
declare global {
  // Use a type that is compatible with other declarations in the project:
  // allow MongoClient | null | undefined so repeated declarations don't conflict.
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | null | undefined;
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | null | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Initialize client / promise once and cache on global
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
  global._mongoClient = client;
  global._mongoClientPromise = clientPromise;
} else {
  // non-null assertion is safe because we checked the presence above
  client = global._mongoClient! as MongoClient;
  clientPromise = global._mongoClientPromise! as Promise<MongoClient>;
}

async function getConnectedClient(): Promise<MongoClient> {
  try {
    return await clientPromise;
  } catch (err) {
    console.error("❌ MongoClient connect failed:", (err as Error).message ?? err);
    throw new Error("Failed to connect to MongoDB. Check your MONGODB_URI and network.");
  }
}

/** Returns the database object (connected client). SERVER ONLY. */
export async function getDB(): Promise<Db> {
  const connected = await getConnectedClient();
  return connected.db(dbName);
}

export const getDatabase = getDB;

/** Convenience helpers for commonly-used collections.
 *  Use these from server-only code (API routes / server components).
 */
export async function getUsersCollection(): Promise<Collection<any>> {
  const db = await getDB();
  return db.collection("users");
}

export async function getPropertiesCollection(): Promise<Collection<any>> {
  const db = await getDB();
  return db.collection("properties");
}

/** Collection that stores AI/activity analyses for properties. */
export async function getPropertyAnalysesCollection(): Promise<Collection<any>> {
  const db = await getDB();
  return db.collection("property_analyses");
}

/** Collection that stores bookings/appointments for properties. */
export async function getBookingsCollection(): Promise<Collection<any>> {
  const db = await getDB();
  return db.collection("bookings");
}

export async function getMessagesCollection(): Promise<Collection<any>> {
  const db = await getDB();
  return db.collection("messages");
}

/** Optional helper: safe get collection by name (keeps typings loose) */
export async function getCollection(name: string): Promise<Collection<any>> {
  const db = await getDB();
  return db.collection(name);
}

export { clientPromise };
