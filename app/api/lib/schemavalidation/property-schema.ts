// app/api/lib/validation/property-schema.ts
import { z } from "zod";

/**
 * Price and contact validators
 */
export const PriceZ = z.number().nonnegative({ message: "Price must be >= 0" });

export const ContactZ = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
});

/**
 * Status enum:
 * - pending : newly created, awaiting admin review
 * - approved: visible publicly (ONLY approved listings are returned on search/home)
 * - rejected: admin rejected listing
 * - suspended: admin suspended a previously approved listing
 * - sold: listing marked sold (no longer actively available)
 */
export const StatusZ = z.enum(["pending", "approved", "rejected", "suspended", "sold"]);

/**
 * CreatePropertySchema
 * - Note: status is intentionally NOT part of the create schema (so client cannot set it).
 *   New listings should default to "pending" on the server and be approved by admins.
 */
export const CreatePropertySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: PriceZ,
  priceUsd: z.number().nonnegative().optional().nullable(), // optional manual USD
  listingType: z.enum(["sale", "rent"]),
  location: z.string().min(1),
  type: z.enum(["residential", "commercial", "land"]),
  beds: z.number().int().nonnegative().optional(),
  baths: z.number().int().nonnegative().optional(),
  sqft: z.number().int().nonnegative().optional(),
  images: z.array(z.string().url()).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
  contact: ContactZ,
});

/**
 * UpdatePropertySchema
 * - allow partial updates, include status but keep in mind only admins should be allowed
 *   to change status in your route/controller logic.
 */
export const UpdatePropertySchema = CreatePropertySchema.partial().extend({
  status: StatusZ.optional(), // optional; update handler must check role before applying
  verified: z.boolean().optional(),
});

/**
 * Types
 */
export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;
export type PropertyStatus = z.infer<typeof StatusZ>;
