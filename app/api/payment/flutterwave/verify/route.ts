import { NextRequest, NextResponse } from "next/server";
import Flutterwave from "flutterwave-node-v3";
import { dbConnect } from "@/lib/dbConnect";
import Investment from "@/app/api/lib/models/Investment";
import Transaction from "@/app/api/lib/models/Transaction";
import Wallet from "@/app/api/lib/models/Wallet";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const tx_ref = searchParams.get("tx_ref");
  const transaction_id = searchParams.get("transaction_id");

  if (status === "successful" && transaction_id) {
    try {
      await dbConnect();

      const flw = new Flutterwave(
        process.env.FLUTTERWAVE_PUBLIC_KEY as string,
        process.env.FLUTTERWAVE_SECRET_KEY as string
      );

      const response = await flw.Transaction.verify({ id: transaction_id });

      if (
        response.status === "success" &&
        response.data.status === "successful" &&
        response.data.amount >= response.data.charged_amount // Basic check
      ) {
        const { userId, propertyId, planId } = response.data.meta;
        const amount = response.data.amount;

        // 1. Check if transaction already exists to avoid duplicates
        const existingTx = await Transaction.findOne({ reference: tx_ref });
        if (existingTx) {
           return NextResponse.redirect(new URL("/investor-portal?status=success", request.url));
        }

        // 2. Create Transaction Record
        await Transaction.create({
          userId,
          type: "investment",
          amount,
          status: "success",
          reference: tx_ref as string,
          description: `Investment in property ${propertyId}`,
        });

        // 3. Create Investment Record
        await Investment.create({
          userId,
          propertyId,
          planId,
          amount,
          status: "active",
        });

        // 4. Update Wallet (Optional: if you want to track total invested or similar)
        // For now, we just ensure a wallet exists
        await Wallet.findOneAndUpdate(
          { userId },
          { $setOnInsert: { balance: 0, currency: "USD" } },
          { upsert: true, new: true }
        );

        return NextResponse.redirect(new URL("/investor-portal?status=success", request.url));
      } else {
        return NextResponse.redirect(new URL("/investor-portal?status=failed", request.url));
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      return NextResponse.redirect(new URL("/investor-portal?status=error", request.url));
    }
  }

  return NextResponse.redirect(new URL("/investor-portal?status=cancelled", request.url));
}
