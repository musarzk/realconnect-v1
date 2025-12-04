import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getPropertiesCollection } from "@/app/api/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

// Helper to normalize _id
function normalize(doc: any) {
  if (!doc) return null;
  return { ...doc, _id: doc._id?.toString?.() ?? doc._id };
}

function corsHeaders(origin?: string | null) {
  const allowOrigin = origin || "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get("origin");
  try {
    const params = await context.params;
    const id = params.id;
    console.log("GET /api/properties/[id] - Received ID:", id);

    const coll = await getPropertiesCollection();

    let doc = null;
    if (ObjectId.isValid(id)) {
      doc = await coll.findOne({ _id: new ObjectId(id) });
    }

    if (!doc) {
      doc = await coll.findOne({
        $or: [
          { id: id },
          { id: Number(id) },
          { slug: id }
        ]
      });
    }

    if (!doc) {
      console.log("GET /api/properties/[id] - Not found for ID:", id);
      return new NextResponse(JSON.stringify({ error: "Property not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
      });
    }

    return new NextResponse(JSON.stringify(normalize(doc)), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
    });
  } catch (err: any) {
    console.error("GET /api/properties/[id] ERROR:", err);
    return new NextResponse(JSON.stringify({ error: "Server error", detail: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
    });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get("origin");
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    const coll = await getPropertiesCollection();

    let query: any = {};
    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
    } else {
      query = { $or: [{ id: id }, { id: Number(id) }, { slug: id }] };
    }

    // Handle image uploads if present
    if (body.images && Array.isArray(body.images)) {
      try {
        const uploadedImages = await Promise.all(
          body.images.map(async (img: string) => {
            if (img.startsWith("http")) return img; // Already a URL
            return await uploadToCloudinary(img, "dwelas/properties");
          })
        );
        body.images = uploadedImages;
      } catch (error) {
        console.error("Image upload failed:", error);
        return new NextResponse(JSON.stringify({ error: "Image upload failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
        });
      }
    }

    const updateDoc = {
      ...body,
      updatedAt: new Date()
    };
    delete updateDoc._id; // Don't update _id

    const result = await coll.updateOne(query, { $set: updateDoc });

    if (result.matchedCount === 0) {
      return new NextResponse(JSON.stringify({ error: "Property not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
      });
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
    });
  } catch (err: any) {
    console.error("PATCH /api/properties/[id] ERROR:", err);
    return new NextResponse(JSON.stringify({ error: "Server error", detail: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
    });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get("origin");
  try {
    const params = await context.params;
    const id = params.id;
    const coll = await getPropertiesCollection();

    let query: any = {};
    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
    } else {
      query = { $or: [{ id: id }, { id: Number(id) }, { slug: id }] };
    }

    const result = await coll.deleteOne(query);

    if (result.deletedCount === 0) {
      return new NextResponse(JSON.stringify({ error: "Property not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
      });
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
    });
  } catch (err: any) {
    console.error("DELETE /api/properties/[id] ERROR:", err);
    return new NextResponse(JSON.stringify({ error: "Server error", detail: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
    });
  }
}
