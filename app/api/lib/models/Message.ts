import type { ObjectId } from "mongodb"

export interface Message {
  _id?: ObjectId
  senderId: string
  senderName: string
  senderEmail: string
  recipientId?: string
  propertyId?: string
  propertyTitle?: string
  subject: string
  content: string
  status: "unread" | "read" | "replied"
  isAdminMessage: boolean
  parentMessageId?: string
  createdAt: Date
  readAt?: Date
  updatedAt: Date
}

export const messageSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["senderId", "senderName", "senderEmail", "subject", "content", "status", "isAdminMessage", "createdAt"],
      properties: {
        _id: { bsonType: "objectId" },
        senderId: { bsonType: "string" },
        senderName: { bsonType: "string" },
        senderEmail: { bsonType: "string" },
        recipientId: { bsonType: "string" },
        propertyId: { bsonType: "string" },
        propertyTitle: { bsonType: "string" },
        subject: { bsonType: "string" },
        content: { bsonType: "string" },
        status: { enum: ["unread", "read", "replied"] },
        isAdminMessage: { bsonType: "bool" },
        parentMessageId: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        readAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
}
