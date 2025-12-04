// app/api/lib/actions/property-actions.ts
"use server";

import { ObjectId } from "mongodb";
import { getPropertiesCollection, getUsersCollection } from "@/app/api/lib/db";
// additional collections used for cascade cleanup on delete
import { getBookingsCollection, getMessagesCollection, getNotificationsCollection } from "@/lib/db";
import { getAuthUser } from "@/app/api/lib/auth";
import {
  CreatePropertySchema,
  UpdatePropertySchema,
  type CreatePropertyInput,
} from "@/app/api/lib/schemavalidation/property-schema";

/**
 * Convert string to ObjectId or return null for invalid values.
 * Keep this helper to centralize validation.
 */
function toObjectId(id: string | undefined | null): ObjectId | null {
  if (!id || typeof id !== "string") return null;
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

/** ---- Create property ---- */
export async function createProperty(raw: unknown): Promise<{ success: boolean; id?: string; status?: number; error?: any }> {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, status: 401, error: "Unauthorized" };

    const data = CreatePropertySchema.parse(raw) as CreatePropertyInput;
    const properties = await getPropertiesCollection();

    const doc = {
      ...data,
      // required numeric conversion & optional USD
      price: Number(data.price),
      priceUsd: data.priceUsd != null ? Number(data.priceUsd) : null,
      // store owner as ObjectId
      ownerId: new ObjectId(user.userId),
      status: "pending", // default status
      views: 0,
      favorites: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await properties.insertOne(doc);
    return { success: true, id: result.insertedId.toString() };
  } catch (err: any) {
    const zErr = err?.issues ?? null;
    if (zErr) return { success: false, status: 400, error: zErr };
    return { success: false, status: 500, error: err?.message ?? "Create failed" };
  }
}

/** ---- Update property (partial) ---- */
export async function updateProperty(propertyId: string, raw: unknown): Promise<{ success: boolean; property?: any; status?: number; error?: any }> {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, status: 401, error: "Unauthorized" };

    const oid = toObjectId(propertyId);
    if (!oid) return { success: false, status: 400, error: "Invalid property ID" };

    const parsed = UpdatePropertySchema.parse(raw);
    const updateFields: Record<string, unknown> = { updatedAt: new Date() };

    // Copy allowed fields if present in parsed payload
    if (parsed.title !== undefined) updateFields.title = parsed.title;
    if (parsed.description !== undefined) updateFields.description = parsed.description;
    if (parsed.price !== undefined) updateFields.price = Number(parsed.price);
    if (parsed.priceUsd !== undefined) updateFields.priceUsd = parsed.priceUsd === null ? null : Number(parsed.priceUsd);
    if (parsed.listingType !== undefined) updateFields.listingType = parsed.listingType;
    if (parsed.location !== undefined) updateFields.location = parsed.location;
    if (parsed.type !== undefined) updateFields.type = parsed.type;
    if (parsed.beds !== undefined) updateFields.beds = parsed.beds;
    if (parsed.baths !== undefined) updateFields.baths = parsed.baths;
    if (parsed.sqft !== undefined) updateFields.sqft = parsed.sqft;
    if (parsed.images !== undefined) updateFields.images = parsed.images;
    if (parsed.amenities !== undefined) updateFields.amenities = parsed.amenities;
    if (parsed.contact !== undefined) updateFields.contact = parsed.contact;

    // Prevent non-admins from updating status fields even if sent in request (defense-in-depth)
    if ((parsed as any).status !== undefined && user.role !== "admin") {
      // ignore incoming status for non-admins
      delete (updateFields as any).status;
    } else if ((parsed as any).status !== undefined && user.role === "admin") {
      // allow admin status changes, but validate later in schema/route if needed
      updateFields.status = (parsed as any).status;
    }

    const properties = await getPropertiesCollection();
    const filter: any = { _id: oid };

    // owner check: non-admins may only update their own properties
    if (user.role !== "admin") filter.ownerId = new ObjectId(user.userId);

    const result = await properties.findOneAndUpdate(filter, { $set: updateFields }, { returnDocument: "after" });

    // Defensive checks: ensure result and result.value exist
    if (!result || !result.value) {
      return { success: false, status: 404, error: "Not found or permission denied" };
    }

    return { success: true, property: result.value };
  } catch (err: any) {
    const zErr = err?.issues ?? null;
    if (zErr) return { success: false, status: 400, error: zErr };
    return { success: false, status: 500, error: err?.message ?? "Update failed" };
  }
}

/** ---- Delete property ---- */
export async function deleteProperty(propertyId: string): Promise<{ success: boolean; status?: number; error?: any }> {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, status: 401, error: "Unauthorized" };

    const oid = toObjectId(propertyId);
    if (!oid) return { success: false, status: 400, error: "Invalid property ID" };

    const properties = await getPropertiesCollection();
    const filter: any = { _id: oid };

    if (user.role !== "admin") filter.ownerId = new ObjectId(user.userId);

    const res = await properties.deleteOne(filter);
    if (!res || res.deletedCount === 0) return { success: false, status: 404, error: "Not found or permission denied" };

    // Best-effort cascade cleanup: remove related bookings, messages and notifications
    try {
      const bookings = await getBookingsCollection();
      const messages = await getMessagesCollection();
      const notifications = await getNotificationsCollection();

      await Promise.all([
        bookings.deleteMany({ propertyId: oid }).catch((e) => { console.error('cascade delete bookings failed', e); }),
        messages.deleteMany({ propertyId: oid }).catch((e) => { console.error('cascade delete messages failed', e); }),
        notifications.deleteMany({ propertyId: oid }).catch((e) => { console.error('cascade delete notifications failed', e); }),
      ]);
    } catch (cascadeErr) {
      // Non-fatal: log and continue
      console.error('cascade cleanup error:', cascadeErr);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, status: 500, error: err?.message ?? "Delete failed" };
  }
}

/** ---- Approve/reject property (admin only) ---- */
export async function approveProperty(propertyId: string, approved: boolean, rejectionReason?: string | null): Promise<{ success: boolean; status?: number; error?: any }> {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") return { success: false, status: 403, error: "Admin only" };

    const oid = toObjectId(propertyId);
    if (!oid) return { success: false, status: 400, error: "Invalid property ID" };

    const properties = await getPropertiesCollection();
    const updateData: any = {
      status: approved ? "approved" : "rejected",
      approvedAt: new Date(),
      approvedBy: new ObjectId(user.userId),
      rejectionReason: approved ? null : (rejectionReason || null),
      updatedAt: new Date(),
    };

    const res = await properties.updateOne({ _id: oid }, { $set: updateData });
    if (!res || res.matchedCount === 0) return { success: false, status: 404, error: "Property not found" };
    return { success: true };
  } catch (err: any) {
    return { success: false, status: 500, error: err?.message ?? "Approve failed" };
  }
}

/** ---- Toggle favorite (atomic-ish) ----
 * Uses $addToSet to add ObjectId to user's favorites if missing,
 * otherwise $pull to remove. We adjust the property's favorites counter accordingly.
 */
export async function togglePropertyFavorite(propertyId: string): Promise<{ success: boolean; status?: number; error?: any; isFavorited?: boolean }> {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, status: 401, error: "Unauthorized" };

    const uid = toObjectId(user.userId);
    if (!uid) return { success: false, status: 401, error: "Invalid user ID" };

    const pid = toObjectId(propertyId);
    if (!pid) return { success: false, status: 400, error: "Invalid property ID" };

    const users = await getUsersCollection();

    // Try to add (if not present)
    const add = await users.updateOne({ _id: uid }, { $addToSet: { favorites: pid as unknown as any } });
    if (add && add.modifiedCount > 0) {
      const properties = await getPropertiesCollection();
      await properties.updateOne({ _id: pid }, { $inc: { favorites: 1 } });
      return { success: true, isFavorited: true };
    }

    // Already existed -> remove
    const pull = await users.updateOne({ _id: uid }, { $pull: { favorites: pid as unknown as any } });
    if (pull && pull.modifiedCount > 0) {
      const properties = await getPropertiesCollection();
      await properties.updateOne({ _id: pid }, { $inc: { favorites: -1 } });
      return { success: true, isFavorited: false };
    }

    // Edge case: nothing changed (maybe inconsistent) => return membership check
    const still = await users.findOne({ _id: uid, favorites: pid });
    return { success: true, isFavorited: !!still };
  } catch (err: any) {
    return { success: false, status: 500, error: err?.message ?? "Toggle favorite failed" };
  }
}
