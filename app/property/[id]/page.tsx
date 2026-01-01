




// ////////////////////////////WORKING WITH POOR UI /////////////////////////////////////////////

// app/property/[id]/page.tsx
// SERVER COMPONENT — do NOT add "use client" here

// import React from "react";
// import { notFound } from "next/navigation";
// import { ObjectId } from "mongodb";
// import { getPropertiesCollection } from "@/app/api/lib/dbv0"; // adjust path if needed
// import {PropertyCard }from "@/components/property-card";

// /**
//  * normalize mongo doc -> plain object for rendering
//  */
// function normalizePropertyDoc(doc: any) {
//   if (!doc) return null;
//   const { _id, ownerId, approvedBy, createdAt, updatedAt, approvedAt, ...rest } = doc;
//   return {
//     _id: _id?.toString?.() ?? null,
//     id: _id?.toString?.() ?? (doc.id ?? null),
//     ownerId: ownerId && typeof ownerId === "object" && ownerId.toString ? ownerId.toString() : ownerId ?? null,
//     approvedBy: approvedBy && typeof approvedBy === "object" && approvedBy.toString ? approvedBy.toString() : approvedBy ?? null,
//     createdAt: createdAt ? new Date(createdAt).toISOString() : null,
//     updatedAt: updatedAt ? new Date(updatedAt).toISOString() : null,
//     approvedAt: approvedAt ? new Date(approvedAt).toISOString() : null,
//     ...rest,
//   };
// }

// /**
//  * Safe helper: resolve params whether it's a Promise or object
//  * (addresses Next runtime message about params possibly being a Promise)
//  */
// async function resolveParams(params: any) {
//   // If params is a Promise, awaiting it returns the object; otherwise Promise.resolve returns the object directly.
//   return await Promise.resolve(params);
// }

// /**
//  * Page component for /property/[id]
//  *
//  * Behavior:
//  * - Resolves params safely (handles Promise or plain object)
//  * - Accepts Mongo ObjectId or numeric/string id:
//  *    * If valid ObjectId -> query by _id:ObjectId(id)
//  *    * Else try to find by string _id, or `id` field, or `slug` field (common patterns)
//  * - Only returns property if status === "approved"
//  * - Returns notFound() if id invalid or property missing
//  */
// export default async function PropertyPage({ params }: { params: any }) {
//   // Resolve params robustly (covers both sync and Promise cases)
//   const resolved = await resolveParams(params);
//   const id = resolved?.id;

//   if (!id) {
//     // no id in URL — show 404
//     return notFound();
//   }

//   const properties = await getPropertiesCollection();

//   let doc: any = null;

//   // 1) If id looks like a Mongo ObjectId, try lookup by _id:ObjectId
//   if (typeof id === "string" && ObjectId.isValid(id)) {
//     try {
//       const oid = new ObjectId(id);
//       doc = await properties.findOne({ _id: oid, status: "approved" });
//     } catch (e) {
//       // if ObjectId constructor fails for any reason, fall through to other lookups
//       doc = null;
//     }
//   }

//   // 2) If not found yet, try numeric or raw string matches (legacy ids or slug)
//   if (!doc) {
//     // try numeric _id (some legacy systems store numeric ids)
//     const num = Number(id);
//     if (!Number.isNaN(num)) {
//       doc = await properties.findOne({ id: num, status: "approved" });
//     }
//   }

//   // 3) If still not found, try matching an `id` or `slug` field (string)
//   if (!doc) {
//     doc = await properties.findOne(
//       {
//         $and: [
//           {
//             $or: [
//               { id: String(id) }, // string _id stored as string (rare)
//               { id: String(id) }, // custom id field
//               { slug: String(id) }, // optional slug field
//             ],
//           },
//           { status: "approved" }, // ensure only approved properties returned
//         ],
//       },
//       { projection: {} }
//     );
//   }

//   if (!doc) {
//     // nothing matched — return 404
//     return notFound();
//   }

//   const property = normalizePropertyDoc(doc);

//   // Render page (server component). You can expand this UI as needed.
//   return (
//     <main className="max-w-5xl mx-auto py-12 px-4">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold">{property.title}</h1>
//         <p className="text-sm text-muted-foreground mt-2">{property.location}</p>
//       </div>

//       <div className="mb-8">
//         <PropertyCard
//           id={property.id ?? property._id ?? "unknown"}
//           title={property.title}
//           price={typeof property.price === "number" ? property.price : Number(property.price || 0)}
//           priceUsd={property.priceUsd ?? null}
//           location={property.location}
//           image={property.images?.[0] ?? "/placeholder.svg"}
//           beds={property.beds ?? 0}
//           baths={property.baths ?? 0}
//           sqft={property.sqft ?? 0}
//           verified={!!property.verified}
//           rating={property.rating ?? 0}
//           viewMode="list"
//         />
//       </div>

//       <section className="prose max-w-none">
//         <h2>Description</h2>
//         <p>{property.description}</p>

//         <h3>Details</h3>
//         <ul>
//           <li>Listing type: {property.listingType}</li>
//           <li>Property type: {property.type}</li>
//           <li>Bedrooms: {property.beds ?? "—"}</li>
//           <li>Bathrooms: {property.baths ?? "—"}</li>
//           <li>Size: {property.sqft ?? "—"} sqft</li>
//         </ul>

//         <h3>Contact</h3>
//         {property.contact ? (
//           <div>
//             <p>{property.contact.name}</p>
//             <p>{property.contact.email}</p>
//             <p>{property.contact.phone}</p>
//           </div>
//         ) : (
//           <p>No contact info provided.</p>
//         )}
//       </section>
//     </main>
//   );
// }

// ////////////////////////////////// UPDATED/////////////////////////////

// // // app/property/[id]/page.tsx

// import React from "react";
// import { notFound } from "next/navigation";
// import { ObjectId } from "mongodb";
// import ClientPropertyDetail from "./propertyDetailClient"
// import { getPropertiesCollection } from "@/lib/db"; // server-only helper

// /**
//  * Turn Mongo document into JSON-serializable object
//  */
// function normalizePropertyDoc(doc: any) {
//   if (!doc) return null;
//   const {
//     _id,
//     ownerId,
//     approvedBy,
//     createdAt,
//     updatedAt,
//     approvedAt,
//     ...rest
//   } = doc;


  

//   return {
//     _id: _id?.toString?.() ?? null,
//     id: _id?.toString?.() ?? (doc.id ?? null),
//     ownerId:
//       ownerId && typeof ownerId === "object" && ownerId.toString
//         ? ownerId.toString()
//         : ownerId ?? null,
//     approvedBy:
//       approvedBy && typeof approvedBy === "object" && approvedBy.toString
//         ? approvedBy.toString()
//         : approvedBy ?? null,
//     createdAt: createdAt ? new Date(createdAt).toISOString() : null,
//     updatedAt: updatedAt ? new Date(updatedAt).toISOString() : null,
//     approvedAt: approvedAt ? new Date(approvedAt).toISOString() : null,
//     ...rest,
//   };
// }

// /** Resolve params whether Promise or plain object */
// async function resolveParams(params: any) {
//   return await Promise.resolve(params);
// }

// export default async function PropertyPage({ params }: { params: any }) {
//   const resolved = await resolveParams(params);
//   const id = resolved?.id;

//   if (!id) return notFound();

//   const coll = await getPropertiesCollection();

//   let doc: any = null;

//   // 1) objectId lookup
//   if (typeof id === "string" && ObjectId.isValid(id)) {
//     try {
//       const oid = new ObjectId(id);
//       doc = await coll.findOne({ _id: oid, status: { $in: ["approve", "approved"] } });
//     } catch (e) {
//       doc = null;
//     }
//   }

//   // 2) numeric id lookup
//   if (!doc) {
//     const num = Number(id);
//     if (!Number.isNaN(num)) {
//       doc = await coll.findOne({ id: num, status: { $in: ["approve", "approved"] } });
//     }
//   }

//   // 3) string id/slug/raw lookup
//   if (!doc) {
//     doc = await coll.findOne({
//       $and: [
//         { $or: [{ id: String(id) }, { slug: String(id) }, {  _id: String(id) as any }] },
//         { status: { $in: ["approve", "approved"] } },
//       ],
//     });
//   }

//   if (!doc) return notFound();

//   const property = normalizePropertyDoc(doc);

//   // Server renders minimal wrapper and passes serialized property to client component
//   return (
//     <div className="min-h-screen bg-background">
//       <ClientPropertyDetail propertyId={property} />
//     </div>
//   );
// }

// ////////////////////////////////// UPDATED FOR TESTING /////////////////////////////


// app/property/[id]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import PropertyDetailClient from "./propertyDetailClient"; // ensure path is correct
import { getPropertiesCollection, getUsersCollection } from "@/lib/db"; // server-only DB helper

// Normalize mongo doc for client
function normalizePropertyDoc(doc: any, agent?: any) {
  if (!doc) return null;
  const { _id, ownerId, approvedBy, createdAt, updatedAt, approvedAt, ...rest } = doc;
  
  // Construct agent object if user data is provided
  const agentData = agent ? {
    name: agent.firstName && agent.lastName ? `${agent.firstName} ${agent.lastName}` : agent.name,
    email: agent.email,
    phone: agent.phone || agent.phoneNumber,
    image: agent.image || agent.avatar,
  } : doc.agent; // fallback to existing agent data if any

  return {
    _id: _id?.toString?.() ?? null,
    id: _id?.toString?.() ?? (doc.id ?? null),
    ownerId:
      ownerId && typeof ownerId === "object" && ownerId.toString
        ? ownerId.toString()
        : ownerId ?? null,
    approvedBy:
      approvedBy && typeof approvedBy === "object" && approvedBy.toString
        ? approvedBy.toString()
        : approvedBy ?? null,
    createdAt: createdAt ? new Date(createdAt).toISOString() : null,
    updatedAt: updatedAt ? new Date(updatedAt).toISOString() : null,
    approvedAt: approvedAt ? new Date(approvedAt).toISOString() : null,
    agent: agentData,
    ...rest,
  };
}

/**
 * Resolve params whether it's a Promise or plain object.
 */
async function resolveParams(params: any) {
  return await Promise.resolve(params);
}

export default async function Page({ params }: { params: any }) {
  // Safely resolve params (avoids "params is a Promise" runtime error)
  const resolved = await resolveParams(params);
  const id = resolved?.id;

  if (!id) return notFound();

  // Server-side: fetch property document (only approved)
  try {
    const coll = await getPropertiesCollection();

    let doc: any = null;

    // Priority 1: ObjectId lookup (most common for modern IDs)
    if (typeof id === "string" && ObjectId.isValid(id)) {
      try {
        doc = await coll.findOne({ _id: new ObjectId(id) });
      } catch {
        doc = null;
      }
    }

    // Priority 2: Try numeric id (legacy) or slug if Priority 1 failed
    if (!doc) {
      const num = Number(id);
      const isNumeric = !Number.isNaN(num);
      
      const orConditions: any[] = [
        { id: id },
        { slug: id }
      ];
      
      if (isNumeric) {
        orConditions.push({ id: num });
      }

      doc = await coll.findOne({ $or: orConditions });
    }

    if (!doc) return notFound();

    // Fetch owner details if ownerId exists
    let agentUser = null;
    if (doc.ownerId) {
      try {
        const usersColl = await getUsersCollection();
        // Try to find user by ObjectId if ownerId is an ObjectId, or string otherwise
        if (ObjectId.isValid(doc.ownerId)) {
             agentUser = await usersColl.findOne({ _id: new ObjectId(doc.ownerId) });
        } else {
             agentUser = await usersColl.findOne({ _id: doc.ownerId });
        }
       
      } catch (e) {
        console.error("Failed to fetch agent user:", e);
      }
    }

    const property = normalizePropertyDoc(doc, agentUser);

    // Pass the normalized property object to the client component so the UI can render immediately.
    return (
      <div className="min-h-screen bg-background">
        {/* You can add Navigation here (server) or keep it inside client */}
        <PropertyDetailClient initialProperty={property} />
      </div>
    );
  } catch (err) {
    // In dev show 404 or notFound; in prod you might want a nicer error page
    console.error("Server /property/[id] fetch error:", err);
    return notFound();
  }
}
