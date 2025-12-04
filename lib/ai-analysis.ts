/**
 * AI Analysis Generator for Properties
 * Automatically generates market analysis based on property attributes
 */

interface PropertyData {
    price: number;
    priceUsd?: number | null;
    location: string;
    beds?: number;
    baths?: number;
    sqft?: number;
    yearBuilt?: number;
    type?: string;
    listingType?: string;
    propertyType?: string;
    amenities?: string[];
}

interface AIAnalysis {
    marketTrend: string;
    roiPotential: string;
    valuationGrade: string;
    pricePerSqft?: string;
}

/**
 * Generate AI market analysis for a property
 */
export function generateAIAnalysis(property: PropertyData): AIAnalysis {
    const {
        price,
        location,
        beds = 0,
        baths = 0,
        sqft = 0,
        yearBuilt,
        amenities = [],
        listingType,
    } = property;

    // Calculate price per sqft
    const pricePerSqft = sqft > 0 ? Math.round(price / sqft) : 0;

    // 1. MARKET TREND ANALYSIS
    const marketTrend = calculateMarketTrend(price, location, yearBuilt, listingType);

    // 2. ROI POTENTIAL ANALYSIS
    const roiPotential = calculateROIPotential(
        price,
        location,
        beds,
        amenities,
        listingType
    );

    // 3. VALUATION GRADE ANALYSIS
    const valuationGrade = calculateValuationGrade(
        price,
        beds,
        baths,
        sqft,
        yearBuilt,
        amenities,
        pricePerSqft
    );

    return {
        marketTrend,
        roiPotential,
        valuationGrade,
        pricePerSqft: sqft > 0 ? `₦${pricePerSqft.toLocaleString()}` : undefined,
    };
}

/**
 * Calculate market trend based on property characteristics
 */
function calculateMarketTrend(
    price: number,
    location: string,
    yearBuilt?: number,
    listingType?: string
): string {
    const currentYear = new Date().getFullYear();
    const age = yearBuilt ? currentYear - yearBuilt : 20;

    // Premium locations (customize based on your market)
    const premiumLocations = [
        "downtown",
        "city center",
        "manhattan",
        "beverly hills",
        "mayfair",
        "central",
        "waterfront",
        "beachfront",
    ];

    const isPremiumLocation = premiumLocations.some((loc) =>
        location.toLowerCase().includes(loc)
    );

    // Scoring system
    let score = 0;

    // Price factor
    if (price > 2000000) score += 3;
    else if (price > 1000000) score += 2;
    else if (price > 500000) score += 1;

    // Location factor
    if (isPremiumLocation) score += 2;

    // Age factor (newer is better)
    if (age < 5) score += 2;
    else if (age < 10) score += 1;

    // Listing type factor
    if (listingType === "sale") score += 1;

    // Determine trend
    if (score >= 6) return "Strong Upward";
    if (score >= 4) return "Steady Growth";
    if (score >= 2) return "Stable";
    return "Moderate";
}

/**
 * Calculate ROI potential
 */
function calculateROIPotential(
    price: number,
    location: string,
    beds: number,
    amenities: string[],
    listingType?: string
): string {
    let baseROI = 7; // Base ROI percentage

    // Location boost
    const premiumLocations = ["downtown", "city center", "central", "waterfront"];
    const isPremium = premiumLocations.some((loc) =>
        location.toLowerCase().includes(loc)
    );
    if (isPremium) baseROI += 2;

    // Size boost (more beds = better rental potential)
    if (beds >= 4) baseROI += 2;
    else if (beds >= 3) baseROI += 1;

    // Amenities boost
    const premiumAmenities = [
        "pool",
        "gym",
        "security",
        "parking",
        "smart home",
        "concierge",
    ];
    const amenityCount = amenities.filter((a) =>
        premiumAmenities.some((pa) => a.toLowerCase().includes(pa))
    ).length;
    baseROI += Math.min(amenityCount, 3); // Max 3% boost from amenities

    // Listing type adjustment
    if (listingType === "rent") baseROI += 1;

    // Price adjustment (lower price = higher ROI potential)
    if (price < 500000) baseROI += 2;
    else if (price > 2000000) baseROI -= 1;

    // Cap ROI between 5% and 15%
    const minROI = Math.max(5, Math.min(baseROI - 1, 14));
    const maxROI = Math.max(6, Math.min(baseROI + 2, 15));

    return `${minROI}-${maxROI}% Annual ROI`;
}

/**
 * Calculate valuation grade (A+ to C)
 */
function calculateValuationGrade(
    price: number,
    beds: number,
    baths: number,
    sqft: number,
    yearBuilt?: number,
    amenities: string[] = [],
    pricePerSqft: number = 0
): string {
    let score = 0;

    // Price per sqft analysis (lower is better value)
    if (pricePerSqft > 0) {
        if (pricePerSqft < 200) score += 3;
        else if (pricePerSqft < 300) score += 2;
        else if (pricePerSqft < 400) score += 1;
    }

    // Size value
    if (sqft >= 3000) score += 2;
    else if (sqft >= 2000) score += 1;

    // Bed/Bath ratio
    const ratio = baths > 0 ? beds / baths : beds;
    if (ratio >= 1.5 && ratio <= 2.5) score += 2; // Good ratio
    else if (ratio >= 1 && ratio <= 3) score += 1;

    // Age factor
    const currentYear = new Date().getFullYear();
    const age = yearBuilt ? currentYear - yearBuilt : 20;
    if (age < 5) score += 3;
    else if (age < 10) score += 2;
    else if (age < 20) score += 1;

    // Amenities count
    if (amenities.length >= 6) score += 2;
    else if (amenities.length >= 4) score += 1;

    // Price range bonus (sweet spot)
    if (price >= 500000 && price <= 1500000) score += 1;

    // Determine grade
    if (score >= 10) return "A+";
    if (score >= 8) return "A";
    if (score >= 6) return "B+";
    if (score >= 4) return "B";
    if (score >= 2) return "C+";
    return "C";
}

/**
 * Generate AI analysis with optional OpenAI enhancement
 * (Placeholder for future AI integration)
 */
export async function generateAIAnalysisWithAI(
    property: PropertyData
): Promise<AIAnalysis> {
    // For now, use logic-based generation
    // TODO: Integrate with OpenAI API for more sophisticated analysis
    return generateAIAnalysis(property);
}
