
// app/api/properties/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getPropertiesCollection } from "@/lib/db";
import { verifyAuth } from "@/app/api/lib/middleware";
import { ObjectId } from "mongodb";
import { UpdatePropertySchema } from "@/app/api/lib/schemavalidation/property-schema";


/**
 * Helper: normalize a Mongo property document for JSON output
 */
function normalizePropertyDoc(doc: any) {
  if (!doc) return doc;
  const { _id, ownerId, approvedBy, createdAt, updatedAt, approvedAt, ...rest } = doc;
  return {
    _id: _id?.toString?.() ?? null,
    ownerId: ownerId && typeof ownerId === "object" && ownerId.toString ? ownerId.toString() : ownerId ?? null,
    approvedBy: approvedBy && typeof approvedBy === "object" && approvedBy.toString ? approvedBy.toString() : approvedBy ?? null,
    createdAt: createdAt ? new Date(createdAt).toISOString() : null,
    updatedAt: updatedAt ? new Date(updatedAt).toISOString() : null,
    approvedAt: approvedAt ? new Date(approvedAt).toISOString() : null,
    ...rest,
  };
}

/**
 * Validate an id string and return ObjectId or null
 */
function toObjectId(id?: string | null) {
  if (!id) return null;
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

/**
 * PATCH /api/properties/:id
 *
 * Body cases supported:
 * 1) Admin status operations:
 *    { action: "approve" }                      -> sets status = "approved", approvedAt, approvedBy
 *    { action: "reject", rejectionReason: "..."} -> sets status = "rejected", rejectionReason, approvedBy
 *    { action: "suspend" }                      -> sets status = "suspended"
 *    { action: "sold" }                         -> sets status = "sold"
 *
 * 2) Partial update of fields (validated by UpdatePropertySchema)
 *    - Admins can update any field including `status` (be careful).
 *    - Owners can update their own listing but CANNOT change `status`, `approvedBy`, `approvedAt`.
 *
 * Returns the updated normalized document or errors with appropriate HTTP status.
 */
export async function PATCH(request: NextRequest, context: any) {
  const p = context?.params;
  const _params = typeof p?.then === "function" ? await p : p;
  const id = _params?.id;
  try {
  const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: "Invalid property id" }, { status: 400 });

    // Authenticate user
    const auth = await verifyAuth(request);
    if (!auth?.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load property to check ownership and current state
    const properties = await getPropertiesCollection();
  const existing = await properties.findOne({ _id: oid });
    if (!existing) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    const userId = auth.userId;
    const isAdmin = auth.role === "admin";
    const isOwner = (() => {
      // existing.ownerId may be ObjectId or string
      if (!existing.ownerId) return false;
      const ownerStr = typeof existing.ownerId === "object" && existing.ownerId.toString ? existing.ownerId.toString() : String(existing.ownerId);
      return String(userId) === ownerStr;
    })();

    // Parse body
    const body = await request.json().catch(() => ({}));

    // --- 1) Action-based admin ops (approve/reject/suspend/sold)
    if (body && typeof body.action === "string") {
      const action = body.action;
      // Only admins allowed to change status by action
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden - admin only" }, { status: 403 });
      }

      const update: any = { updatedAt: new Date() };

      switch (action) {
        case "approve":
          update.status = "approved";
          update.approvedAt = new Date();
          update.approvedBy = ObjectId.isValid(String(userId)) ? new ObjectId(String(userId)) : userId;
          update.rejectionReason = null;
          break;
        case "reject":
          update.status = "rejected";
          update.approvedAt = new Date();
          update.approvedBy = ObjectId.isValid(String(userId)) ? new ObjectId(String(userId)) : userId;
          update.rejectionReason = typeof body.rejectionReason === "string" ? body.rejectionReason : null;
          break;
        case "suspend":
          update.status = "suspended";
          break;
        case "sold":
          update.status = "sold";
          break;
        default:
          return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }

      const res = await properties.updateOne({ _id: oid }, { $set: update });
      if (!res || res.matchedCount === 0) return NextResponse.json({ error: "Update failed" }, { status: 500 });

      const updated = await properties.findOne({ _id: oid });
      return NextResponse.json(normalizePropertyDoc(updated), { status: 200 });
    }

    // --- 2) Partial updates using UpdatePropertySchema
    // Validate and parse (Zod will ensure types). UpdatePropertySchema allows `status` but we block status changes for non-admins.
    let parsed;
    try {
      parsed = UpdatePropertySchema.parse(body);
    } catch (zerr: any) {
      return NextResponse.json({ error: "Validation failed", details: zerr?.issues ?? zerr }, { status: 400 });
    }

    // Ownership / role checks: owners can edit their own properties (except status-related fields)
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden - not owner or admin" }, { status: 403 });
    }

    // If not admin, strip admin-only fields from parsed
    if (!isAdmin) {
      // prevent tampering of status and approval metadata
      delete (parsed as any).status;
      delete (parsed as any).approvedBy;
      delete (parsed as any).approvedAt;
      delete (parsed as any).rejectionReason;
    }

    // Convert numeric fields explicitly
    const updateFields: any = { updatedAt: new Date() };
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
    if (parsed.status !== undefined && isAdmin) updateFields.status = parsed.status; // admin only
    if (parsed.verified !== undefined && isAdmin) updateFields.verified = parsed.verified; // admin only

    // If admin approves via status field set approvedAt/approvedBy automatically when moving to 'approved'
    if (isAdmin && parsed.status === "approved") {
      updateFields.approvedAt = new Date();
      updateFields.approvedBy = ObjectId.isValid(String(userId)) ? new ObjectId(String(userId)) : userId;
      updateFields.rejectionReason = null;
    }

  const updateRes = await properties.updateOne({ _id: oid }, { $set: updateFields });

    if (!updateRes || updateRes.matchedCount === 0) {
      return NextResponse.json({ error: "Not found or update failed" }, { status: 404 });
    }

    const updatedDoc = await properties.findOne({ _id: oid });
    return NextResponse.json(normalizePropertyDoc(updatedDoc), { status: 200 });
  } catch (err: any) {
    console.error("PATCH /api/properties/[id] error:", err);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}
