import mongoose, { Schema, model, models } from "mongoose";

const PropertySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    priceUsd: { type: Number },
    listingType: { type: String, enum: ["sale", "rent"], required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ["residential", "commercial", "land"], required: true },
    propertyType: { type: String },
    beds: { type: Number },
    baths: { type: Number },
    sqft: { type: Number },
    yearBuilt: { type: Number },
    images: [{ type: String }],
    ownerId: { type: String, required: true },
    agentId: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended", "sold"],
      default: "pending",
    },
    verified: { type: Boolean, default: false },
    amenities: [{ type: String }],
    contact: {
      name: String,
      email: String,
      phone: String,
    },
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Property = models.Property || model("Property", PropertySchema);

export default Property;
