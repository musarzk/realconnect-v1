import type { ObjectId } from "mongodb"

export interface Booking {
  _id?: ObjectId
  propertyId: string
  propertyTitle?: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  visitDate: Date
  visitTime: string
  guestCount: number
  specialRequests?: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  adminNotes?: string
  confirmedBy?: string
  createdAt: Date
  updatedAt: Date
}

export const bookingSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["propertyId", "userId", "userName", "userEmail", "userPhone", "visitDate", "visitTime", "guestCount", "status", "createdAt"],
      properties: {
        _id: { bsonType: "objectId" },
        propertyId: { bsonType: "string" },
        propertyTitle: { bsonType: "string" },
        userId: { bsonType: "string" },
        userName: { bsonType: "string" },
        userEmail: { bsonType: "string" },
        userPhone: { bsonType: "string" },
        visitDate: { bsonType: "date" },
        visitTime: { bsonType: "string" },
        guestCount: { bsonType: "int" },
        specialRequests: { bsonType: "string" },
        status: { enum: ["pending", "confirmed", "cancelled", "completed"] },
        adminNotes: { bsonType: "string" },
        confirmedBy: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
}
