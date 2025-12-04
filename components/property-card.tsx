

"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MapPin, Home, Maximize2 } from "lucide-react";

interface PropertyCardProps {
  id: string | number;
  title: string;
  price: number;
  priceUsd?: number | null;
  location: string;
  image: string;
  beds: number;
  baths: number;
  sqft: number;
  status?: "pending" | "approved" | "rejected" | "suspended" | "sold";
  verified?: boolean;
  rating?: number;
  viewMode?: "grid" | "list";
  type?: "sale" | "rent";
  propertyType?: string;
  ownerAvatar?: string | null;
}

export function PropertyCard({
  id,
  title,
  price,
  priceUsd = null,
  location,
  image,
  beds,
  baths,
  sqft,
  status,
  verified = false,
  rating = 4.5,
  viewMode = "grid",
  type = "sale",
  propertyType,
  ownerAvatar,
}: PropertyCardProps) {
  return (
    <Link href={`/property/${id}`}>
      <Card
        className={`overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer h-full flex flex-col 
          ${viewMode === "list" ? "sm:flex-row" : ""}
          !p-0 !m-0
          rounded-b-none
          rounded-t-0.09
          ${status === "sold" ? "opacity-75" : ""}
        `}
      >
        {/* 🔥 Image flush top, with rounded-top-2xl */}
        <div
          className={`
            relative bg-muted overflow-hidden 
            ${viewMode === "list" ? "w-full sm:w-40 md:w-48 h-full flex-shrink-0" : "h-40 w-full"}
            !p-0 !m-0 
            
            
          `}
        >
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover block !p-0 !m-0 rounded-t-none"
          />

          {/* SOLD Badge - Prominent diagonal ribbon */}
          {status === "sold" && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="bg-red-600 text-white px-8 py-3 font-bold text-2xl transform -rotate-12 shadow-2xl">
                SOLD
              </div>
            </div>
          )}

          {verified && (
            <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
              Verified
            </div>
          )}

          <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-gray-100 px-3 py-1 rounded-full text-xs font-semibold capitalize shadow-sm">
            {propertyType}
          </div>



        </div>

        {/* Content */}
        <div className={`flex-1 flex flex-col justify-between relative ${viewMode === "list" ? "p-3 sm:p-4" : "p-4"}`}>
          {/* Owner Avatar */}
          {ownerAvatar && (
            <div className="absolute bottom-12 right-4 z-10">
              <img
                src={ownerAvatar}
                alt="Owner"
                className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
              />
            </div>
          )}
          <div>
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className={`font-semibold line-clamp-2 flex-1 ${viewMode === "list" ? "text-sm sm:text-base" : ""}`}>
                {title}
              </h3>
              <div className="flex flex-col gap-1 items-end flex-shrink-0">
                <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                  {rating}★
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${type === "rent"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  }`}>
                  {type === "rent" ? "For Rent" : "For Sale"}
                </span>
              </div>
            </div>

            {/* Location */}
            <p className="text-xs text-primary font-semibold mb-2 flex items-center gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </p>
          </div>

          {/* Footer */}
          <div>
            <p className={`font-bold text-primary mb-3 ${viewMode === "list" ? "text-xl sm:text-2xl" : "text-2xl"}`}>
              {price >= 1000000000
                ? `N${(price / 1000000000).toFixed(1)}B`
                : `N${(price / 1000000).toFixed(1)}M`
              }
            </p>

            {priceUsd != null && (
              <p className="text-xs text-gray-600 font-medium mb-2">
                (${Number(priceUsd).toLocaleString()})
              </p>
            )}

            <div
              className={`flex text-xs text-gray-600 font-medium pt-3 gap-2 
                ${viewMode === "list" ? "flex-wrap sm:justify-between" : "justify-between"}
              `}
            >
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Home className="h-3 w-3" /> {beds} Beds
              </span>
              <span className="whitespace-nowrap">{baths} Baths</span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Maximize2 className="h-3 w-3" /> {sqft.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
