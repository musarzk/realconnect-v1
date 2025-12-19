import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/lib/auth";
import { FLW_BASE_URL_FINAL, FLW_SECRET_KEY } from "@/app/api/lib/flutterwave/config";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 0. CHECK FOR KEYS
    if (!FLW_SECRET_KEY) {
      console.error("CRITICAL: FLUTTERWAVE_SECRET_KEY is missing in .env.local");
      return NextResponse.json({ 
        error: "Server configuration error", 
        message: "Payment gateway not configured. Please add FLUTTERWAVE_SECRET_KEY to .env.local" 
      }, { status: 500 });
    }

    const body = await request.json();
    const { amount, currency = "USD", email, name, phonenumber, propertyId, planId, userId } = body;

    if (!amount || !email || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tx_ref = `inv_${Date.now()}_${userId}`;

    const payload = {
      tx_ref,
      amount,
      currency,
      payment_options: "card, banktransfer, ussd",
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/flutterwave/verify`,
      customer: {
        email,
        phonenumber: phonenumber || "",
        name: name || "",
      },
      meta: {
        userId,
        propertyId,
        planId,
      },
      customizations: {
        title: "Property Investment",
        description: "Payment for property investment",
        logo: "https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg", // Replace with app logo
      },
    };

    // 3. Create Payment Link via Standard V3 API
    // Using Standard API: https://api.flutterwave.com/v3/payments
    const endpoint = `${FLW_BASE_URL_FINAL}/payments`;
    console.log("Initiating Standard Payment via:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Flutterwave Standard API error:", JSON.stringify(data, null, 2));
      return NextResponse.json({ error: data.message || "Failed to initiate payment" }, { status: response.status });
    }

    if (data.status === "success" && data.data && data.data.link) {
      return NextResponse.json({ link: data.data.link });
    } else {
      console.error("Flutterwave API response error:", data);
      return NextResponse.json({ 
        error: data.message || "Failed to generate payment link",
        details: data 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Flutterwave payment error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      message: error.message 
    }, { status: 500 });
  }
}
