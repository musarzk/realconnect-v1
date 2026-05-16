import React from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PartnersCarousel } from "@/components/partners-carousel";
import { HomeSearchClient } from "@/components/home-search-client";
import { getPropertiesCollection, getUsersCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

// Use incremental caching for faster page loads while still refreshing data every minute.
export const revalidate = 60;

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
  // We fetch only the first page of approved properties and use server-side pagination.
  let properties: Property[] = [];
  let total = 0;
  try {
    const coll = await getPropertiesCollection();
    total = await coll.countDocuments({ status: "approved" });

    // Fetch only approved properties with only the fields we actually render.
    const docs = await coll
      .find({ status: "approved" })
      .project({
        _id: 1,
        title: 1,
        price: 1,
        priceUsd: 1,
        location: 1,
        images: 1,
        beds: 1,
        baths: 1,
        sqft: 1,
        verified: 1,
        rating: 1,
        type: 1,
        listingType: 1,
        propertyType: 1,
        featured: 1,
        status: 1,
        ownerId: 1,
      })
      .sort({ createdAt: -1 })
      .limit(12)
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
      image: d.images?.[0] ?? "/placeholder.svg",
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
        initialTotal={total}
        initialFilters={initialFilters} 
      />

      <PartnersCarousel />
      <Footer />
    </div>
  );
}
