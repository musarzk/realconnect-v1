import { NextRequest, NextResponse } from "next/server";
import { getPropertiesCollection } from "@/lib/db";
import { generateAIAnalysis } from "@/lib/ai-analysis";

export async function GET(request: NextRequest) {
  try {
    const collection = await getPropertiesCollection();

    // Fetch approved properties
    const properties = await collection
      .find({ status: "approved" })
      .limit(50)
      .toArray();

    console.log(`Found ${properties.length} approved properties`);

    // If no properties, return empty array
    if (properties.length === 0) {
      console.log("No approved properties found in database");
      return NextResponse.json([]);
    }

    // Filter and format properties based on AI analysis
    const investmentOpportunities = properties
      .map((prop: any) => {
        // Generate AI analysis if missing
        const aiAnalysis = prop.aiAnalysis || generateAIAnalysis({
          price: prop.price || 0,
          priceUsd: prop.priceUsd,
          location: prop.location || "",
          beds: prop.beds,
          baths: prop.baths,
          sqft: prop.sqft,
          yearBuilt: prop.yearBuilt,
          type: prop.type,
          listingType: prop.listingType,
          propertyType: prop.propertyType,
          amenities: prop.amenities || [],
        });

        return {
          ...prop,
          aiAnalysis,
        };
      })
      .filter((prop: any) => {
        // More lenient filtering: grade C or better OR ROI >= 8%
        const gradeOrder = ["A+", "A", "B+", "B", "C", "C+", "D", "F"];
        const propGrade = prop.aiAnalysis?.valuationGrade || "F";
        const gradeIndex = gradeOrder.indexOf(propGrade);
        const isGoodGrade = gradeIndex >= 0 && gradeIndex <= 4; // A+ to C

        // Extract ROI - more lenient, >= 8%
        const roiString = prop.aiAnalysis?.roiPotential || "0";
        const roiMatch = roiString.match(/(\d+)/);
        const roi = roiMatch ? parseInt(roiMatch[1]) : 0;
        const isGoodROI = roi >= 8; // Lowered from 10 to 8

        // Accept if EITHER good grade OR good ROI (not both required)
        const accepted = isGoodGrade || isGoodROI;
        
        if (!accepted) {
          console.log(`Filtered out: ${prop.title} - Grade: ${propGrade}, ROI: ${roi}%`);
        }

        return accepted;
      })
      .slice(0, 20) // Limit to 20 opportunities
      .map((prop: any) => {
        // Extract ROI percentage
        const roiString = prop.aiAnalysis?.roiPotential || "10-12% Annual ROI";
        const roiMatch = roiString.match(/(\d+)/);
        const expectedROI = roiMatch ? parseInt(roiMatch[1]) : 12;

        // Determine risk level based on grade
        const grade = prop.aiAnalysis?.valuationGrade || "C";
        let riskLevel: "low" | "medium" | "high" = "medium";
        if (["A+", "A"].includes(grade)) riskLevel = "low";
        else if (["B+", "B"].includes(grade)) riskLevel = "medium";
        else riskLevel = "high";

        // Calculate min investment (20% of property price)
        const minInvestment = Math.round((prop.price || 0) * 0.2);

        // Calculate years to breakeven
        const yearsToBreakeven = expectedROI > 0 ? Math.ceil(100 / expectedROI) : 10;

        return {
          id: prop._id.toString(),
          title: prop.title,
          location: prop.location,
          price: prop.price || 0,
          expectedROI,
          riskLevel,
          minInvestment,
          investors: Math.floor(Math.random() * 50) + 10, // Random for now
          yearsToBreakeven,
          image: prop.images?.[0] || "/placeholder.svg",
          verified: prop.verified || false,
          aiAnalysis: prop.aiAnalysis,
        };
      });

    console.log(`Returning ${investmentOpportunities.length} investment opportunities`);

    return NextResponse.json(investmentOpportunities);
  } catch (error) {
    console.error("Error fetching investor properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch investment opportunities" },
      { status: 500 }
    );
  }
}
