// import { NextRequest, NextResponse } from "next/server";
// import { getPropertiesCollection } from "@/lib/db";
// import { generateAIAnalysis } from "@/lib/ai-analysis";

// export async function GET(request: NextRequest) {
//   try {
//     const collection = await getPropertiesCollection();

//     // Fetch approved properties
//     const properties = await collection
//       .find({ status: "approved" })
//       .limit(50)
//       .toArray();

//     console.log(`Found ${properties.length} approved properties`);

//     // If no properties, return empty array
//     if (properties.length === 0) {
//       console.log("No approved properties found in database");
//       return NextResponse.json([]);
//     }

//     // Filter and format properties based on AI analysis
//     const investmentOpportunities = properties
//       .map((prop: any) => {
//         // Generate AI analysis if missing
//         const aiAnalysis = prop.aiAnalysis || generateAIAnalysis({
//           price: prop.price || 0,
//           priceUsd: prop.priceUsd,
//           location: prop.location || "",
//           beds: prop.beds,
//           baths: prop.baths,
//           sqft: prop.sqft,
//           yearBuilt: prop.yearBuilt,
//           type: prop.type,
//           listingType: prop.listingType,
//           propertyType: prop.propertyType,
//           amenities: prop.amenities || [],
//         });

//         return {
//           ...prop,
//           aiAnalysis,
//         };
//       })
//       .filter((prop: any) => {
//         // More lenient filtering: grade C or better OR ROI >= 8%
//         const gradeOrder = ["A+", "A", "B+", "B", "C", "C+", "D", "F"];
//         const propGrade = prop.aiAnalysis?.valuationGrade || "F";
//         const gradeIndex = gradeOrder.indexOf(propGrade);
//         const isGoodGrade = gradeIndex >= 0 && gradeIndex <= 4; // A+ to C

//         // Extract ROI - more lenient, >= 8%
//         const roiString = prop.aiAnalysis?.roiPotential || "0";
//         const roiMatch = roiString.match(/(\d+)/);
//         const roi = roiMatch ? parseInt(roiMatch[1]) : 0;
//         const isGoodROI = roi >= 8; // Lowered from 10 to 8

//         // Accept if EITHER good grade OR good ROI (not both required)
//         const accepted = isGoodGrade || isGoodROI;
        
//         if (!accepted) {
//           console.log(`Filtered out: ${prop.title} - Grade: ${propGrade}, ROI: ${roi}%`);
//         }

//         return accepted;
//       })
//       .slice(0, 20) // Limit to 20 opportunities
//       .map((prop: any) => {
//         // Extract ROI percentage
//         const roiString = prop.aiAnalysis?.roiPotential || "10-12% Annual ROI";
//         const roiMatch = roiString.match(/(\d+)/);
//         const expectedROI = roiMatch ? parseInt(roiMatch[1]) : 12;

//         // Determine risk level based on grade
//         const grade = prop.aiAnalysis?.valuationGrade || "C";
//         let riskLevel: "low" | "medium" | "high" = "medium";
//         if (["A+", "A"].includes(grade)) riskLevel = "low";
//         else if (["B+", "B"].includes(grade)) riskLevel = "medium";
//         else riskLevel = "high";

//         // Calculate min investment (20% of property price)
//         const minInvestment = Math.round((prop.price || 0) * 0.2);

//         // Calculate years to breakeven
//         const yearsToBreakeven = expectedROI > 0 ? Math.ceil(100 / expectedROI) : 10;

//         return {
//           id: prop._id.toString(),
//           title: prop.title,
//           location: prop.location,
//           price: prop.price || 0,
//           expectedROI,
//           riskLevel,
//           minInvestment,
//           investors: Math.floor(Math.random() * 50) + 10, // Random for now
//           yearsToBreakeven,
//           image: prop.images?.[0] || "/placeholder.svg",
//           verified: prop.verified || false,
//           aiAnalysis: prop.aiAnalysis,
//         };
//       });

//     console.log(`Returning ${investmentOpportunities.length} investment opportunities`);

//     return NextResponse.json(investmentOpportunities);
//   } catch (error) {
//     console.error("Error fetching investor properties:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch investment opportunities" },
//       { status: 500 }
//     );
//   }
// }

// //////////////////////////////////////////////////////////

import { NextRequest, NextResponse } from "next/server";
import { getPropertiesCollection } from "@/lib/db";
import { generateAIAnalysis } from "@/lib/ai-analysis";

/* =========================================================
   ROI EXTRACTION
========================================================= */
const extractROI = (roiString?: string): number => {
  if (!roiString) return 12;

  // Extract all numbers from string
  const matches = roiString.match(/\d+/g);

  if (!matches || matches.length === 0) {
    return 12;
  }

  const numbers = matches.map(Number);

  // Average values if range exists
  const averageROI =
    numbers.reduce((sum, num) => sum + num, 0) / numbers.length;

  return Math.round(averageROI);
};

/* =========================================================
   RISK CALCULATION
========================================================= */
const calculateRiskLevel = ({
  grade,
  roi,
  yearBuilt,
}: {
  grade: string;
  roi: number;
  yearBuilt?: number;
}): "low" | "medium" | "high" => {
  let score = 0;

  // Grade factor
  if (["A+", "A"].includes(grade)) {
    score += 1;
  } else if (["B+", "B"].includes(grade)) {
    score += 2;
  } else {
    score += 3;
  }

  // ROI factor
  if (roi >= 20) {
    score += 3;
  } else if (roi >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // Property age factor
  const currentYear = new Date().getFullYear();
  const propertyAge = yearBuilt
    ? currentYear - yearBuilt
    : 5;

  if (propertyAge > 25) {
    score += 2;
  } else if (propertyAge > 10) {
    score += 1;
  }

  // Final risk classification
  if (score <= 3) return "low";
  if (score <= 6) return "medium";

  return "high";
};

/* =========================================================
   BREAKEVEN CALCULATION
========================================================= */
const calculateBreakevenYears = (
  propertyPrice: number,
  expectedROI: number
): number => {
  if (!propertyPrice || expectedROI <= 0) {
    return 10;
  }

  // Annual rental yield estimate
  const annualRentalYield = expectedROI / 100;

  // Estimated operational deductions
  const operationalFactor = 0.75;

  // Estimated annual net profit
  const annualNetProfit =
    propertyPrice *
    annualRentalYield *
    operationalFactor;

  if (annualNetProfit <= 0) {
    return 10;
  }

  return Math.ceil(propertyPrice / annualNetProfit);
};

/* =========================================================
   INVESTMENT SCORE
========================================================= */
const calculateInvestmentScore = ({
  roi,
  gradeIndex,
  verified,
}: {
  roi: number;
  gradeIndex: number;
  verified: boolean;
}) => {
  return (
    roi * 0.5 +
    (10 - gradeIndex) * 5 +
    (verified ? 10 : 0)
  );
};

export async function GET(request: NextRequest) {
  try {
    const collection = await getPropertiesCollection();

    /* =====================================================
       FETCH APPROVED PROPERTIES
    ===================================================== */
    const properties = await collection
      .find({ status: "approved" })
      .limit(50)
      .toArray();

    console.log(
      `Found ${properties.length} approved properties`
    );

    if (properties.length === 0) {
      return NextResponse.json([]);
    }

    /* =====================================================
       PROPERTY PROCESSING
    ===================================================== */

    const gradeOrder = [
      "A+",
      "A",
      "B+",
      "B",
      "C+",
      "C",
      "D",
      "F",
    ];

    const investmentOpportunities = properties
      .map((prop: any) => {
        /* ================================================
           GENERATE AI ANALYSIS
        ================================================ */
        const aiAnalysis =
          prop.aiAnalysis ||
          generateAIAnalysis({
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

        /* ================================================
           ROI EXTRACTION
        ================================================ */
        const expectedROI = extractROI(
          aiAnalysis?.roiPotential
        );

        /* ================================================
           GRADE
        ================================================ */
        const grade =
          aiAnalysis?.valuationGrade || "C";

        const gradeIndex =
          gradeOrder.indexOf(grade);

        /* ================================================
           FILTERING RULES
        ================================================ */

        const isGoodGrade =
          gradeIndex >= 0 &&
          gradeIndex <= 5;

        const isGoodROI =
          expectedROI >= 8;

        // Require BOTH
        const accepted =
          isGoodGrade &&
          isGoodROI;

        if (!accepted) {
          console.log(
            `Filtered out: ${prop.title} | Grade: ${grade} | ROI: ${expectedROI}%`
          );

          return null;
        }

        /* ================================================
           RISK LEVEL
        ================================================ */
        const riskLevel =
          calculateRiskLevel({
            grade,
            roi: expectedROI,
            yearBuilt: prop.yearBuilt,
          });

        /* ================================================
           MINIMUM INVESTMENT
        ================================================ */
        const minInvestment = Math.round(
          (prop.price || 0) * 0.2
        );

        /* ================================================
           BREAKEVEN YEARS
        ================================================ */
        const yearsToBreakeven =
          calculateBreakevenYears(
            prop.price || 0,
            expectedROI
          );

        /* ================================================
           INVESTMENT SCORE
        ================================================ */
        const investmentScore =
          calculateInvestmentScore({
            roi: expectedROI,
            gradeIndex,
            verified: prop.verified || false,
          });

        /* ================================================
           PROJECTED APPRECIATION
        ================================================ */
        const annualAppreciation = 0.08;

        const projectedValue5Years =
          Math.round(
            (prop.price || 0) *
              Math.pow(
                1 + annualAppreciation,
                5
              )
          );

        /* ================================================
           ESTIMATED INVESTORS
        ================================================ */
        const investors = Math.max(
          10,
          Math.floor(expectedROI * 2)
        );

        return {
          id: prop._id.toString(),
          title: prop.title,
          location: prop.location,

          price: prop.price || 0,

          expectedROI,

          riskLevel,

          minInvestment,

          investors,

          yearsToBreakeven,

          image:
            prop.images?.[0] ||
            "/placeholder.svg",

          verified:
            prop.verified || false,

          aiAnalysis,

          investmentScore,

          projectedValue5Years,

          grade,
        };
      })

      // Remove nulls
      .filter(Boolean)

      // Sort best investments first
      .sort(
        (a: any, b: any) =>
          b.investmentScore -
          a.investmentScore
      )

      // Limit opportunities
      .slice(0, 20);

    console.log(
      `Returning ${investmentOpportunities.length} investment opportunities`
    );

    return NextResponse.json(
      investmentOpportunities
    );
  } catch (error) {
    console.error(
      "Error fetching investor properties:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch investment opportunities",
      },
      { status: 500 }
    );
  }
}