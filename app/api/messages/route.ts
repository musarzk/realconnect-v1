// app/api/messages/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getMessagesCollection } from "@/lib/db";
import { verifyAuth } from "../lib/middleware";
import { sendEmail } from "@/lib/email";
import { ObjectId } from "mongodb";

/**
 * Create a new message (user -> admin or admin -> user)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const messages = await getMessagesCollection();

    // Safe sender name: prefer caller-provided name, then authenticated email, then fallback.
    const senderName = (body.senderName as string) ?? (auth.email ?? "User");

    const message: any = {
      senderId: auth.userId,
      senderName,
      senderEmail: auth.email ?? "",
      recipientId: body.recipientId ?? null, // null means admin
      propertyId: body.propertyId ?? null,
      propertyTitle: body.propertyTitle ?? null,
      subject: body.subject ?? "",
      content: body.content ?? "",
      status: "unread",
      // mark message as admin-origin when an admin posts
      isAdminMessage: auth.role === "admin",
      parentMessageId: body.parentMessageId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await messages.insertOne(message);

    // Email notifications
    const adminEmail = process.env.ADMIN_EMAIL || "mucerabdool@gmail.com";
    const userEmail = auth.email || "";
    const subject = `New Message: ${message.subject}`;
    const html = `<p>From: ${message.senderName} (${message.senderEmail})</p><p>Subject: ${message.subject}</p><p>Content: ${message.content}</p>`;
    if (adminEmail) await sendEmail(adminEmail, subject, html);
    if (userEmail) await sendEmail(userEmail, subject, html);

    return NextResponse.json({ id: result.insertedId, ...message }, { status: 201 });
  } catch (e) {
    console.error("Failed to create message:", e);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}

/* GET and PATCH unchanged (keep your existing code) */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get("propertyId")
    const status = searchParams.get("status") as "unread" | "read" | "replied" | null

    const messages = await getMessagesCollection()
    const query: any = {}

    if (propertyId) query.propertyId = propertyId
    if (status) query.status = status

    // Regular users see only their own messages (sent or received)
    if (auth.role !== "admin") {
      query.$or = [{ senderId: auth.userId }, { recipientId: auth.userId }]
    }

    const results = await messages.find(query).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(results)
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
    }

    const messages = await getMessagesCollection()
    
    let queryId: any = id
    try {
      if (ObjectId.isValid(id)) {
        queryId = new ObjectId(id)
      }
    } catch (e) {
      // ignore
    }

    const result = await messages.updateOne(
      { _id: queryId },
      { $set: { status, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Error updating message:", e)
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
  }
}
