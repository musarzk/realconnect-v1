import React from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PartnersCarousel } from "@/components/partners-carousel";
import { HomeSearchClient } from "@/components/home-search-client";
import { getPropertiesCollection, getUsersCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

// Force dynamic rendering if we want fresh data on every request, 
// or use revalidate for ISR. for "super fast", caching is good, but 
// let's start with dynamic to ensure data is correct.
export const dynamic = "force-dynamic";

type Property = {
  _id: string;
  id?: string;
  title: string;
  price: number;
  priceUsd?: number | null;
  location: string;
  images?: string[];
  beds?: number;
  baths?: number;
  sqft?: number;
  verified?: boolean;
  rating?: number;
  type?: string;
  listingType?: string;
  propertyType?: string;
  featured?: boolean;
  status?: string;
  ownerAvatar?: string;
};

/** Normalize Mongo doc to client-friendly object */
function normalize(doc: any): Property {
  const { _id, ownerId, approvedBy, createdAt, updatedAt, approvedAt, ...rest } = doc;
  return {
    _id: _id?.toString?.() ?? String(_id),
    // Convert dates to string if needed, though they are usually passed as is if serializable
    // but for Client Components (props), they must be serializable (no Date objects)
    // The original API normalized them to ISO strings.
    ownerId: ownerId?.toString?.() ?? (ownerId as string | null),
    ...rest,
  };
}

export default async function SearchPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  // 1. Fetch properties directly from DB (Server Side)
  // We fetch ALL approved properties to support client-side filtering (matching original behavior).
  // For massive datasets, we should switch to server-side filtering.
  let properties: Property[] = [];
  try {
    const coll = await getPropertiesCollection();
    // Fetch only approved properties
    const docs = await coll
      .find({ status: "approved" })
      .sort({ createdAt: -1 })
      .toArray();

    // 2. Populate Owners
    const ownerIds = [...new Set(docs.map((d) => d.ownerId).filter((id) => id))];
    let ownerMap: Record<string, string> = {};

    if (ownerIds.length > 0) {
      try {
        const usersColl = await getUsersCollection();
        const users = await usersColl
          .find({ _id: { $in: ownerIds } })
          .project({ _id: 1, avatar: 1 })
          .toArray();
        
        users.forEach((u) => {
          if (u.avatar) {
             ownerMap[u._id.toString()] = u.avatar;
          }
        });
      } catch (e) {
        console.error("Failed to populate owners within SearchPage", e);
      }
    }

    properties = docs.map((d) => ({
      ...normalize(d),
      ownerAvatar: d.ownerId ? ownerMap[d.ownerId.toString()] : undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch properties in SearchPage:", error);
    // We can choose to show an error or just empty list. 
    // The Client Component doesn't handle global error props, 
    // but empty list will show "No properties found".
    properties = [];
  }

  // 3. Prepare initial filters from URL
  const initialFilters = {
    location: typeof searchParams.location === "string" ? searchParams.location : "",
    type: typeof searchParams.type === "string" ? searchParams.type : "all",
    propertyType: typeof searchParams.propertyType === "string" ? searchParams.propertyType : "all",
    priceMin: typeof searchParams.priceMin === "string" ? searchParams.priceMin : "",
    priceMax: typeof searchParams.priceMax === "string" ? searchParams.priceMax : "",
    beds: typeof searchParams.beds === "string" ? searchParams.beds : "",
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Pass data to Client Component */}
      <HomeSearchClient 
        initialProperties={properties} 
        initialFilters={initialFilters} 
      />

      <PartnersCarousel />
      <Footer />
    </div>
  );
}
