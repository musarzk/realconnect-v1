import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/lib/auth";
import { tokenManager } from "@/app/api/lib/flutterwave/tokenManager";
import { FLW_BASE_URL_FINAL } from "@/app/api/lib/flutterwave/config";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency = "USD", email, name, phonenumber, propertyId, planId, userId } = body;

    if (!amount || !email || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Get Access Token
    const accessToken = await tokenManager.getToken();

    const tx_ref = `inv_${Date.now()}_${userId}`;

    const payload = {
      tx_ref,
      amount,
      currency,
      payment_options: "card, mobilemoneyghana, ussd",
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

    // 3. Create Payment Link via F4B API
    // Note: Assuming the endpoint is /payments based on standard v3, but using the F4B base URL.
    // If F4B has a different endpoint for link creation, this might need adjustment.
    // The user provided example used /customers, so we assume standard REST structure.
    const response = await fetch(`${FLW_BASE_URL_FINAL}/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Flutterwave API error:", data);
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
