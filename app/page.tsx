"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Filter, ChevronDown, Grid3x3, List, AlertTriangle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/pagination";
import { PropertyCard } from "@/components/property-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PartnersCarousel } from "@/components/partners-carousel";
import { HeroSearch } from "@/components/hero-search";

type RawApiResponse = any;

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

export default function SearchPage() {
  const searchParams = useSearchParams();

  // Data + loading + error
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filters (initialize from search params)
  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "",
    priceMin: "",
    priceMax: "",
    beds: "",
    type: (searchParams.get("type") as string) || "all",
    propertyType: "all",
  });

  // Helper: normalize API response into array of properties
  function normalizeToArray(res: RawApiResponse): Property[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.properties)) return res.properties;
    if (Array.isArray(res.items)) return res.items;
    if (Array.isArray(res.data)) return res.data;
    for (const key of ["results", "rows", "docs"]) {
      if (Array.isArray(res[key])) return res[key];
    }
    if (res._id && res.title) return [res as Property];
    return [];
  }

  // Fetch approved properties on mount
  useEffect(() => {
    let mounted = true;

    async function fetchProperties() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/properties", { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`API error ${res.status}: ${txt}`);
        }
        const json = await res.json();
        const arr = normalizeToArray(json);

        if (!mounted) return;

        // Debug: see raw properties (development only)
        if (process.env.NODE_ENV === 'development') {
          console.log("Raw properties from API:", arr);
        }

        // Only keep approved properties (case insensitive)
        const approved = arr.filter(
          (prop: Property) => (prop.status ?? "").toLowerCase() === "approved"
        );

        if (process.env.NODE_ENV === 'development') {
          console.log("Approved properties:", approved);
        }

        setProperties(approved);
      } catch (err: any) {
        console.error("Failed to fetch properties:", err);
        if (!mounted) return;
        setError(err?.message || "Failed to load properties");
        setProperties([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    fetchProperties();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter + sort
  const filteredAndSortedProperties = useMemo(() => {
    const list = Array.isArray(properties) ? properties : [];

    const result = list.filter((property) => {
      const matchesLocation =
        !filters.location || (property.location ?? "").toLowerCase().includes(filters.location.toLowerCase());
      const matchesType = filters.type === "all" || property.listingType === filters.type;
      const matchesBeds = !filters.beds || (property.beds ?? 0) >= Number.parseInt(filters.beds);
      const matchesMinPrice = !filters.priceMin || property.price >= Number.parseInt(filters.priceMin);
      const matchesMaxPrice = !filters.priceMax || property.price <= Number.parseInt(filters.priceMax);
      const matchesPropertyType = filters.propertyType === "all" || property.propertyType === filters.propertyType;

      return matchesLocation && matchesType && matchesBeds && matchesMinPrice && matchesMaxPrice && matchesPropertyType;
    });

    // Sorting
    if (sortBy === "priceLow") {
      result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortBy === "priceHigh") {
      result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortBy === "featured") {
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [properties, filters, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProperties.length / itemsPerPage));
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProperties, currentPage]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen  flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-destructive/10 p-6 rounded-full mb-6">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Unable to load properties</h2>
          <p className="text-gray-600 font-medium max-w-md mb-8">
            {error === "Database connection failed"
              ? "We're having trouble connecting to our services. Please check your internet connection or try again later."
              : "Something went wrong while fetching the properties. Please try again."}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <Navigation />

      <HeroSearch
        onSearch={(filters) => {
          handleFilterChange({
            ...filters, // filters from HeroSearch contains location and type
            priceMin: "",
            priceMax: "",
            beds: "",
            propertyType: "all",
          } as any)
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-12 flex flex-col items-center">
        <div className="mb-8 text-center w-full">
          <p className="text-xl font-semibold text-foreground">
            Showing {filteredAndSortedProperties.length} approved properties
          </p>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="font-bold mb-6 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Listing Type</label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    value={filters.type}
                    onChange={(e) => handleFilterChange({ ...filters, type: e.target.value })}
                  >
                    <option value="all">All</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input
                    placeholder="City or area"
                    value={filters.location}
                    onChange={(e) => handleFilterChange({ ...filters, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Min Price</label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange({ ...filters, priceMin: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Max Price</label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange({ ...filters, priceMax: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bedrooms</label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    value={filters.beds}
                    onChange={(e) => handleFilterChange({ ...filters, beds: e.target.value })}
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Property Type</label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange({ ...filters, propertyType: e.target.value })}
                  >
                    <option value="all">All Types</option>
                    <option value="apartment">Apartment</option>
                    <option value="residential">Residential</option>
                    <option value="office">Office</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <Button className="w-full">Apply Filters</Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() =>
                    handleFilterChange({
                      location: "",
                      priceMin: "",
                      priceMax: "",
                      beds: "",
                      type: "all",
                      propertyType: "all",
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-xs sm:text-sm font-medium whitespace-nowrap">Sort by:</label>
                <div className="relative w-full sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-lg bg-gray-200 border-none appearance-none focus:outline-none pr-8 text-sm"
                  >
                    <option value="featured">Featured</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-muted-foreground" />
                </div>
              </div>
            </div>

            {filteredAndSortedProperties.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600 font-medium mb-4">No approved properties found.</p>
                <Button
                  onClick={() =>
                    handleFilterChange({
                      location: "",
                      priceMin: "",
                      priceMax: "",
                      beds: "",
                      type: "all",
                      propertyType: "all",
                    })
                  }
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max"
                      : "space-y-4"
                  }
                >
                  {paginatedProperties.map((property) => (
                    <PropertyCard
                      key={property._id}
                      id={property._id}
                      title={property.title}
                      price={property.price}
                      priceUsd={property.priceUsd}
                      location={property.location}
                      image={property.images?.[0] || "/placeholder.svg"}
                      beds={property.beds ?? 0}
                      baths={property.baths ?? 0}
                      sqft={property.sqft ?? 0}
                      verified={property.verified ?? false}
                      rating={property.rating ?? 4.5}
                      viewMode={viewMode}
                      type={property.type === "rent" ? "rent" : "sale"}
                      propertyType={property.propertyType}
                      ownerAvatar={property.ownerAvatar}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredAndSortedProperties.length}
                  itemsPerPage={itemsPerPage}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <PartnersCarousel />
      <Footer />
    </div>
  );
}
