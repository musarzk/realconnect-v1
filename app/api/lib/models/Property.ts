import type { ObjectId } from "mongodb"

export interface Property {
  _id?: ObjectId
  title: string
  description: string
  price: number
  priceUsd?: number | null
  listingType: "sale" | "rent"
  location: string
  type: "residential" | "commercial" | "land"
  propertyType?: string
  beds?: number
  baths?: number
  sqft?: number
  yearBuilt?: number
  images: string[]
  ownerId: string
  agentId?: string
  status: "pending" | "approved" | "rejected" | "suspended" | "sold"
  verified?: boolean
  approvedAt?: Date
  approvedBy?: string
  rejectionReason?: string
  amenities: string[]
  contact: {
    name: string
    email: string
    phone: string
  }
  views: number
  favorites: number
  createdAt: Date
  updatedAt: Date
}

export const propertySchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "title",
        "description",
        "price",
        "listingType",
        "location",
        "type",
        "images",
        "ownerId",
        "status",
        "contact",
        "createdAt",
      ],
      properties: {
        _id: { bsonType: "objectId" },
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        price: { bsonType: "number" },
        priceUsd: { bsonType: ["number", "null"] },
        listingType: { enum: ["sale", "rent"] },
        location: { bsonType: "string" },
        type: { enum: ["residential", "commercial", "land"] },
        beds: { bsonType: "int" },
        baths: { bsonType: "int" },
        sqft: { bsonType: "int" },
        images: { bsonType: "array", items: { bsonType: "string" } },
        ownerId: { bsonType: "string" },
        agentId: { bsonType: "string" },
        status: { enum: ["pending", "approved", "rejected", "suspended", "sold"], default: "pending" },
        verified: { bsonType: "bool" },
        contact: { bsonType: "object" },
        views: { bsonType: "int" },
        favorites: { bsonType: "int" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
}
