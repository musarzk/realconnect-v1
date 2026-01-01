

// app/api/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { Filter, Collection } from "mongodb";
import { ObjectId } from "mongodb";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { z } from "zod";

/**
 * Try a set of common paths for the getPropertiesCollection helper so this file
 * won't crash at import-time if the helper lives in a different file (dbv0/db).
 */
async function resolveGetPropertiesCollection(): Promise<null | (() => Promise<Collection<any>>)> {
  const tries = [
    "@/app/api/lib/dbv0",
    "@/app/api/lib/db",
    "@/lib/dbv0",
    "@/lib/db",
    "@/app/api/lib/db",
  ];
  for (const p of tries) {
    try {
      // dynamic import so missing modules don't break compile-time
      // @ts-ignore
      const mod = await import(p);
      if (mod && typeof mod.getPropertiesCollection === "function") {
        return mod.getPropertiesCollection;
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

/** Normalize Mongo doc to client-friendly object (string _id, ISO dates) */
function normalize(doc: any) {
  if (!doc) return null;
  const { _id, ownerId, approvedBy, createdAt, updatedAt, approvedAt, ...rest } = doc;
  return {
    _id: _id?.toString?.() ?? _id,
    ownerId: ownerId && ownerId.toString ? ownerId.toString() : ownerId ?? null,
    approvedBy: approvedBy && approvedBy.toString ? approvedBy.toString() : approvedBy ?? null,
    createdAt: createdAt ? new Date(createdAt).toISOString() : null,
    updatedAt: updatedAt ? new Date(updatedAt).toISOString() : null,
    approvedAt: approvedAt ? new Date(approvedAt).toISOString() : null,
    ...rest,
  };
}

/** Build CORS headers for a response */
function corsHeaders(origin?: string | null) {
  const allowOrigin = origin || "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

/** OPTIONS for preflight (required when the browser preflights POST with credentials) */
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

/** GET /api/properties
 *  Query params:
 *    - status (optional)
 *    - limit (optional)
 *    - ? other filters can be added easily
 */
export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  try {
    const getPropertiesCollection = await resolveGetPropertiesCollection();
    if (!getPropertiesCollection) {
      console.error("GET /api/properties - DB helper not found");
      return new NextResponse(JSON.stringify({ error: "Server misconfiguration: DB helper missing" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      });
    }

    const url = new URL(req.url);
    const q = url.searchParams;
    const status = q.get("status") ?? undefined;
    const limit = Math.min(Math.max(Number(q.get("limit") || 50), 1), 200);
    const page = Math.max(Number(q.get("page") || 1), 1);
    const skip = (page - 1) * limit;

    const location = q.get("location");
    const type = q.get("type");
    const propertyType = q.get("propertyType");
    const beds = q.get("beds");
    const priceMin = q.get("priceMin");
    const priceMax = q.get("priceMax");

    const coll = await getPropertiesCollection();

    const filter: Filter<any> = {};
    if (status) filter.status = status;
    else filter.status = "approved"; // Default to approved only for public search

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }
    if (type && type !== "all") {
      filter.listingType = type;
    }
    if (propertyType && propertyType !== "all") {
      filter.type = propertyType;
    }
    if (beds) {
      filter.beds = { $gte: Number(beds) };
    }
    
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    const total = await coll.countDocuments(filter);
    const docs = await coll.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();

    // Populate owner avatar
    const ownerIds = [...new Set(docs.map(d => d.ownerId).filter(id => id))];
    let ownerMap: Record<string, string> = {};
    
    if (ownerIds.length > 0) {
      try {
        // dynamic import to avoid circular deps if any
        const { getUsersCollection } = await import("@/lib/db");
        const usersColl = await getUsersCollection();
        const users = await usersColl.find({ _id: { $in: ownerIds } }).project({ _id: 1, avatar: 1 }).toArray();
        users.forEach(u => {
          if (u.avatar) ownerMap[u._id.toString()] = u.avatar;
        });
      } catch (e) {
        console.error("Failed to populate owners", e);
      }
    }

    const out = docs.map((d) => ({
      ...normalize(d),
      ownerAvatar: d.ownerId ? ownerMap[d.ownerId.toString()] : null
    }));

    return new NextResponse(JSON.stringify({
      properties: out,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        ...corsHeaders(origin),
      },
    });
  } catch (err: any) {
    console.error("GET /api/properties error:", err);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch properties", detail: String(err?.message || err) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });
  }
}

/**
 * POST /api/properties
 * - Accepts JSON body for a new property.
 * - Minimal validation here (title, price, location) — expand to match your Zod schema if you use one.
 * - Returns created document (normalized) on success.
 */
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  try {
    const getPropertiesCollection = await resolveGetPropertiesCollection();
    if (!getPropertiesCollection) {
      console.error("POST /api/properties - DB helper not found");
      return new NextResponse(JSON.stringify({ error: "Server misconfiguration: DB helper missing" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      });
    }

    // parse JSON safely
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new NextResponse(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      });
    }

    // Validate with Zod
    let validatedData;
    try {
      // Import dynamically to avoid circular deps if any, or just standard import
      const { CreatePropertySchema } = await import("@/app/api/lib/schemavalidation/property-schema");
      validatedData = CreatePropertySchema.parse(body);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return new NextResponse(JSON.stringify({ error: "Validation failed", details: err.errors }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
        });
      }
      throw err;
    }

    const doc: Record<string, any> = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending", // Force status to pending for new creations
      images: [], // Handle images separately below
    };
    
    // Handle image uploads
    if (validatedData.images && Array.isArray(validatedData.images)) {
      try {
        const uploadedImages = await Promise.all(
          validatedData.images.map(async (img: string) => {
            if (img.startsWith("http")) return img; // Already a URL
            return await uploadToCloudinary(img, "dwelas/properties");
          })
        );
        doc.images = uploadedImages;
      } catch (error) {
        console.error("Image upload failed:", error);
        return new NextResponse(JSON.stringify({ error: "Image upload failed" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin),
          },
        });
      }
    }

    // optional: set ownerId from cookie token if available (non-breaking if you don't have auth configured)
    try {
      const token = req.cookies.get("token")?.value;
      if (token) {
        // do a safe attempt to decode as JWT without external libs to avoid breaking imports here
        // If you have a proper auth helper available, use it instead (this is only a best-effort decode)
        // NOTE: this only extracts payload if token is unencrypted JWT in three-part base64 form.
        const parts = token.split(".");
        if (parts.length === 3) {
          try {
            const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
            const payload = JSON.parse(payloadJson);
            if (payload?.userId || payload?.id) {
              doc.ownerId = ObjectId.isValid(payload.userId || payload.id)
                ? new ObjectId(payload.userId || payload.id)
                : payload.userId || payload.id;
            }
          } catch {
            /* ignore payload parse failures */
          }
        }
      }
    } catch {
      // ignore cookie parsing errors — not fatal
    }

    const coll = await getPropertiesCollection();
    const res = await coll.insertOne(doc);

    if (!res?.insertedId) {
      throw new Error("Insert failed");
    }

    const inserted = await coll.findOne({ _id: res.insertedId });
    return new NextResponse(JSON.stringify(normalize(inserted)), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });
  } catch (err: any) {
    console.error("POST /api/properties error:", err);
    return new NextResponse(JSON.stringify({ error: "Failed to create property", detail: String(err?.message || err) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });
  }
}
