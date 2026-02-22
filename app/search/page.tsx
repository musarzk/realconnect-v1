

"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Filter, ChevronDown, Grid3x3, List } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/pagination";
import { PropertyCard } from "@/components/property-card";
import { LoadingCard } from "@/components/loading";

type ServerProperty = {
  _id?: string;
  id?: string;
  title: string;
  price: number;
  priceUsd?: number | null;
  location: string;
  images?: string[];
  beds?: number;
  baths?: number;
  sqft?: number;
  status?: "pending" | "approved" | "rejected" | "suspended" | "sold";
  verified?: boolean;
  rating?: number;
  listingType?: string;
  type?: string;
  propertyType?: string;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [filters, setFilters] = useState({
    location: (searchParams.get("location") ?? "") as string,
    priceMin: "",
    priceMax: "",
    beds: "",
    type: (searchParams.get("type") ?? "all") as string,
    propertyType: "all",
  });

  const [properties, setProperties] = useState<ServerProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // Build memoized query string for API to keep effect deps stable
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.location) params.set("location", filters.location);
    if (filters.type && filters.type !== "all") params.set("type", filters.type);
    if (filters.priceMin) params.set("priceMin", filters.priceMin);
    if (filters.priceMax) params.set("priceMax", filters.priceMax);
    params.set("page", String(currentPage));
    params.set("limit", String(itemsPerPage));
    return params.toString();
  }, [filters.location, filters.type, filters.priceMin, filters.priceMax, currentPage, itemsPerPage]);

  // Fetch from API when filters or page change
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/properties?${queryString}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed to load (${res.status})`);
        }
        const json = await res.json();

        // normalize response: server returns { properties: [...], pagination: {...} }
        let items: ServerProperty[] = [];
        if (Array.isArray(json)) items = json;
        else if (Array.isArray(json.properties)) items = json.properties;
        else if (Array.isArray(json.items)) items = json.items;
        else {
          console.warn("Unexpected properties response shape:", json);
          items = [];
        }

        if (!mounted) return;
        setProperties(items);
        setTotalItems(json?.pagination?.total ?? items.length);
      } catch (err: any) {
        console.error("Load properties error", err);
        if (!mounted) return;
        setError(err?.message ?? "Failed to load properties");
        setProperties([]);
        setTotalItems(0);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [queryString]);

  // Client-side filtering & sorting fallback (if you want to refine after server-side)
  const filteredAndSortedProperties = useMemo(() => {
    // Ensure we always operate on an array
    const list = Array.isArray(properties) ? [...properties] : [];

    // Apply simple client-side filters (already handled server-side but kept for UX)
    const result = list.filter((property) => {
      const matchesLocation =
        !filters.location || property.location?.toLowerCase().includes(filters.location.toLowerCase());
      const matchesType = !filters.type || filters.type === "all" || property.listingType === filters.type;
      const matchesBeds = !filters.beds || (property.beds ?? 0) >= Number.parseInt(filters.beds || "0");
      const matchesMinPrice = !filters.priceMin || (property.price ?? 0) >= Number.parseInt(filters.priceMin || "0");
      const matchesMaxPrice = !filters.priceMax || (property.price ?? 0) <= Number.parseInt(filters.priceMax || "0");
      // Note: ServerProperty type definition might need propertyType added if it's not there, but assuming it's on the object
      const matchesPropertyType = !filters.propertyType || filters.propertyType === "all" || (property as any).propertyType === filters.propertyType;

      return matchesLocation && matchesType && matchesBeds && matchesMinPrice && matchesMaxPrice && matchesPropertyType;
    });

    if (sortBy === "priceLow") {
      result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortBy === "priceHigh") {
      result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortBy === "featured") {
      // assume server returned featured ordering; otherwise fallback to rating
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return result;
  }, [properties, filters, sortBy]);

  // paginated slice (already server-paginated, but keep client-side safety)
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProperties.slice(start, start + itemsPerPage);
  }, [filteredAndSortedProperties, currentPage]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Perfect Property</h1>
          <p className="text-muted-foreground">
            Showing {totalItems} results
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
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
                    onChange={(e) => handleFilterChange({ type: e.target.value })}
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
                    onChange={(e) => handleFilterChange({ location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Min Price</label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange({ priceMin: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Max Price</label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange({ priceMax: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bedrooms</label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    value={filters.beds}
                    onChange={(e) => handleFilterChange({ beds: e.target.value })}
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <Button className="w-full" onClick={() => setCurrentPage(1)}>Apply Filters</Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setFilters({ location: "", priceMin: "", priceMax: "", beds: "", type: "all", propertyType: "all" });
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}><Grid3x3 className="h-4 w-4" /></button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}><List className="h-4 w-4" /></button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Sort by:</label>
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border border-gray-400 rounded-lg bg-background appearance-none pr-8">
                    <option value="featured">Featured</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none text-muted-foreground" />
                </div>
              </div>
            </div>

            {loading ? (
              <LoadingCard message="Loading properties..." />
            ) : error ? (
              <Card className="p-12 text-center text-red-600">{error}</Card>
            ) : paginated.length === 0 ? (
              <Card className="p-12 text-center">No properties found.</Card>
            ) : (
              <>
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max" : "space-y-4"}>
                  {paginated.map((p) => (
                    <PropertyCard
                      key={p._id ?? p.id}
                      id={p._id ?? p.id ?? ""}
                      title={p.title}
                      price={p.price}
                      priceUsd={p.priceUsd}
                      location={p.location}
                      image={p.images?.[0] ?? "/placeholder.svg"}
                      beds={p.beds ?? 0}
                      baths={p.baths ?? 0}
                      sqft={p.sqft ?? 0}
                      status={p.status}
                      verified={!!p.verified}
                      rating={p.rating ?? 0}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} />
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
