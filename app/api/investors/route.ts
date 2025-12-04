import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Investment from "@/app/api/lib/models/Investment";
import User from "@/app/api/lib/models/User";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Fetch all users with 'investor' role
    const investors = await User.find({ role: "investor" })
      .select("firstName lastName email phone location avatar approved suspendedAt createdAt")
      .lean();

    // Enhance with investment stats
    const investorsWithStats = await Promise.all(
      investors.map(async (investor) => {
        const investments = await Investment.find({ userId: investor._id });
        const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
        const activeInvestments = investments.filter((inv) => inv.status === "active").length;

        return {
          ...investor,
          totalInvested,
          activeInvestments,
          totalInvestments: investments.length,
          joinDate: investor.createdAt || investor._id.getTimestamp(),
        };
      })
    );

    return NextResponse.json(investorsWithStats);
  } catch (error) {
    console.error("Error fetching investors:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
