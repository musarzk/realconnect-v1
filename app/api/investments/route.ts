import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";
import Investment from "@/app/api/lib/models/Investment";

import Property from "@/app/api/lib/models/PropertyModel"; // Import to register model
import User from "@/app/api/lib/models/User"; // Import to register model

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    console.log("Fetching investments...");
    let query = {};
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
      }
      query = { userId };
    }

    // Ensure models are registered
    console.log("Models registered:", mongoose.modelNames());

    const investments = await Investment.find(query)
      .populate("userId", "firstName lastName email")
      .populate("propertyId", "title location price images")
      .sort({ createdAt: -1 });
    
    console.log(`Found ${investments.length} investments`);
    return NextResponse.json(investments);
  } catch (error) {
    console.error("Error fetching investments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    // Manual creation if needed
    try {
        await dbConnect();
        const body = await request.json();
        const investment = await Investment.create(body);
        return NextResponse.json(investment, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create investment" }, { status: 500 });
    }
}
