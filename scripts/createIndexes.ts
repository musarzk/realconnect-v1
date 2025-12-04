import { getDb } from "../lib/db";

async function createIndexes() {
  const db = await getDb();

  // Properties indexes
  const properties = db.collection("properties");
  await properties.createIndex({ location: 1 });
  await properties.createIndex({ ownerId: 1 });
  await properties.createIndex({ status: 1 });
  await properties.createIndex({ createdAt: -1 });
  await properties.createIndex({ "address.coordinates": "2dsphere" }); // Geo-spatial if exists
  await properties.createIndex({ type: 1, status: 1 }); // Compound index for filtering

  // Users indexes
  const users = db.collection("users");
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ role: 1 });
  await users.createIndex({ createdAt: -1 });

  // Bookings indexes
  const bookings = db.collection("bookings");
  await bookings.createIndex({ propertyId: 1 });
  await bookings.createIndex({ userId: 1 });
  await bookings.createIndex({ status: 1 });
  await bookings.createIndex({ createdAt: -1 });
  await bookings.createIndex({ userId: 1, status: 1 }); // Compound for user bookings filtering

  // Messages indexes
  const messages = db.collection("messages");
  await messages.createIndex({ senderId: 1 });
  await messages.createIndex({ receiverId: 1 });
  await messages.createIndex({ conversationId: 1 });
  await messages.createIndex({ createdAt: -1 });
  await messages.createIndex({ senderId: 1, receiverId: 1 }); // Compound for conversations

  // Notifications indexes
  const notifications = db.collection("notifications");
  await notifications.createIndex({ userId: 1 });
  await notifications.createIndex({ createdAt: -1 });
  await notifications.createIndex({ read: 1 });
  await notifications.createIndex({ userId: 1, read: 1 }); // Compound for unread notifications

  console.log("✅ All database indexes created successfully");
  console.log("- Properties: location, ownerId, status, createdAt, geo-spatial, compound");
  console.log("- Users: email (unique), role, createdAt");
  console.log("- Bookings: propertyId, userId, status, createdAt, compound");
  console.log("- Messages: senderId, receiverId, conversationId, createdAt, compound");
  console.log("- Notifications: userId, createdAt, read, compound");
  process.exit(0);
}

createIndexes().catch(console.error);
