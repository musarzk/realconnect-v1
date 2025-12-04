import type { ObjectId } from "mongodb";

export interface PriceFields {
  /** price in Naira whole amount (store as number) */
  ngn: number; // alias: property.price (but we keep single top-level number for backward compatibility)
}

export interface Property {
  _id?: ObjectId;
  title: string;
  description: string;
  price: number;           // required: Naira (e.g., 5300000000)
  priceUsd?: number | null; // optional manual USD provided by poster
  listingType: "sale" | "rent";
  location: string;
  type: "residential" | "commercial" | "land";
  beds?: number;
  baths?: number;
  sqft?: number;
  images: string[];
  ownerId: ObjectId;       // stored as ObjectId in DB
  agentId?: ObjectId | null;
  status: "pending" | "approved" | "rejected";
  approvedAt?: Date | null;
  approvedBy?: ObjectId | null;
  rejectionReason?: string | null;
  amenities: string[];
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  views: number;
  favorites: number;
  createdAt: Date;
  updatedAt?: Date | null;
}
