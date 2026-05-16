
"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Filter, ChevronDown, Grid3x3, List } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { PropertyCard } from "@/components/property-card";
import { HeroSearch } from "@/components/hero-search";

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

interface HomeSearchClientProps {
    initialProperties: Property[];
    initialTotal?: number;
    initialFilters?: {
        location?: string;
        type?: string; // listing type
        propertyType?: string;
        priceMin?: string;
        priceMax?: string;
        beds?: string;
    };
}

export function HomeSearchClient({ initialProperties, initialTotal = 0, initialFilters }: HomeSearchClientProps) {
    // State initialization
    const [properties, setProperties] = useState<Property[]>(initialProperties);
    const [totalResults, setTotalResults] = useState<number>(initialTotal || initialProperties.length);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState("featured");
    const [currentPage, setCurrentPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const itemsPerPage = 12;

    const [filters, setFilters] = useState({
        location: initialFilters?.location || "",
        priceMin: initialFilters?.priceMin || "",
        priceMax: initialFilters?.priceMax || "",
        beds: initialFilters?.beds || "",
        type: initialFilters?.type || "all",
        propertyType: initialFilters?.propertyType || "all",
    });

    // Fetch properties from API with server-side filtering and pagination.
    const fetchProperties = async (currentFilters: typeof filters, page = 1, sortOption = sortBy) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (currentFilters.location) params.append("location", currentFilters.location);
            if (currentFilters.type !== "all") params.append("type", currentFilters.type);
            if (currentFilters.propertyType !== "all") params.append("propertyType", currentFilters.propertyType);
            if (currentFilters.beds) params.append("beds", currentFilters.beds);
            if (currentFilters.priceMin) params.append("priceMin", currentFilters.priceMin);
            if (currentFilters.priceMax) params.append("priceMax", currentFilters.priceMax);
            if (sortOption) params.append("sortBy", sortOption);
            params.append("page", String(page));
            params.append("limit", String(itemsPerPage));

            const res = await fetch(`/api/properties?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setProperties(data.properties || []);
                setTotalResults(typeof data.pagination?.total === "number" ? data.pagination.total : 0);
                setCurrentPage(data.pagination?.page ?? page);
            }
        } catch (error) {
            console.error("Failed to fetch properties:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const setFiltersAndFetch = async (newFilters: typeof filters, page = 1) => {
        setFilters(newFilters);
        setCurrentPage(page);
        setIsInitialLoad(false);
        await fetchProperties(newFilters, page);
    };

    const applyFilters = () => {
        setFiltersAndFetch(filters, 1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchProperties(filters, page);
    };

    const handleSortChange = (value: string) => {
        setSortBy(value);
        fetchProperties(filters, currentPage, value);
    };

    // Server-side filtering and pagination. The API returns only the current page of results.
    const visibleProperties = useMemo(() => properties, [properties]);

    const totalPages = Math.max(1, Math.ceil(totalResults / itemsPerPage));


    return (
        <>
            <HeroSearch
                onSearch={(initialFilters) => {
                    const combinedFilters = {
                        ...filters,
                        ...initialFilters,
                        priceMin: "",
                        priceMax: "",
                        beds: "",
                        propertyType: "all",
                    } as typeof filters;
                    setFiltersAndFetch(combinedFilters, 1);
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-12 flex flex-col items-center">
                <div className="mb-8 text-center w-full relative">
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground">
                        Showing {properties.length} of {totalResults} approved properties
                        {isInitialLoad && initialProperties.length === 12 && (
                            <span className="text-xs text-muted-foreground ml-2">(Initial load limit)</span>
                        )}
                    </p>
                    {isLoading && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        </div>
                    )}
                </div>

                <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className={`lg:col-span-1 transition-all duration-300 ease-in-out ${filtersOpen ? "max-h-[1000px] opacity-100 mb-6" : "max-h-0 opacity-0 overflow-hidden"} lg:max-h-full lg:opacity-100 lg:overflow-visible lg:mb-0`}>
                        <Card className="p-6 lg:sticky lg:top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-bold flex items-center gap-2">
                                    <Filter className="h-4 w-4" /> Filters
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="lg:hidden"
                                    onClick={() => setFiltersOpen(false)}
                                >
                                    Close
                                </Button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Listing Type</label>
                                    <select
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        value={filters.type}
                                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
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
                                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Min Price</label>
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.priceMin}
                                        onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Max Price</label>
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.priceMax}
                                        onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Bedrooms</label>
                                    <select
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        value={filters.beds}
                                        onChange={(e) => setFilters({ ...filters, beds: e.target.value })}
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
                                        onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="residential">Residential</option>
                                        <option value="office">Office</option>
                                        <option value="commercial">Commercial</option>
                                    </select>
                                </div>

                                <Button className="w-full" onClick={applyFilters}>Apply Filters</Button>
                                <Button
                                    variant="outline"
                                    className="w-full bg-transparent"
                                    onClick={() =>
                                        setFiltersAndFetch({
                                            location: "",
                                            priceMin: "",
                                            priceMax: "",
                                            beds: "",
                                            type: "all",
                                            propertyType: "all",
                                        }, 1)
                                    }
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Properties Grid */}
                    <div className="lg:col-span-3">
                        <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center mb-6">
                            <div className="flex items-center justify-between w-full gap-2 lg:w-auto">
                                <div className="hidden lg:flex gap-2 items-center">
                                    <button
                                        type="button"
                                        title="Grid view"
                                        aria-label="Grid view"
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === "grid"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                            }`}
                                    >
                                        <Grid3x3 className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        title="List view"
                                        aria-label="List view"
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === "list"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                            }`}
                                    >
                                        <List className="h-4 w-4" />
                                    </button>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="lg:hidden flex items-center gap-2"
                                    onClick={() => setFiltersOpen((open) => !open)}
                                    title={filtersOpen ? "Hide filters" : "Show filters"}
                                >
                                    {filtersOpen ? "Hide filters" : "Filter"}
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                                <label className="text-xs sm:text-sm font-medium whitespace-nowrap">Sort by:</label>
                                <div className="relative w-full sm:w-auto max-w-[220px]">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                        className="w-full sm:w-[220px] px-3 py-2 rounded-lg bg-gray-200 border-none appearance-none focus:outline-none pr-8 text-sm"
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

                        {properties.length === 0 ? (
                            <Card className="p-12 text-center">
                                <p className="text-gray-600 font-medium mb-4">No approved properties found.</p>
                                <Button
                                    onClick={() =>
                                        setFiltersAndFetch({
                                            location: "",
                                            priceMin: "",
                                            priceMax: "",
                                            beds: "",
                                            type: "all",
                                            propertyType: "all",
                                        }, 1)
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
                                            : "space-y-6"
                                    }
                                >
                                    {visibleProperties.map((property) => (
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
                                            type={property.listingType === "rent" ? "rent" : "sale"}
                                            propertyType={property.propertyType}
                                            ownerAvatar={property.ownerAvatar}
                                        />
                                    ))}
                                </div>

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    totalItems={totalResults}
                                    itemsPerPage={itemsPerPage}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}