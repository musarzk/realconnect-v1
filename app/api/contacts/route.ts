import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, getMessagesCollection } from "../lib/db"
import { sendEmail } from "../../../lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message, propertyId } = body

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const contacts = db.collection("contacts")

    const contact = {
      name,
      email,
      phone: phone || "",
      subject,
      message,
      propertyId: propertyId || null,
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await contacts.insertOne(contact)

    // Also save to messages collection for Admin visibility
    try {
      const messages = await getMessagesCollection()
      const messageEntry = {
        senderId: null, // Anonymous/Guest
        senderName: name,
        senderEmail: email,
        recipientId: null, // Admin
        propertyId: propertyId || null,
        propertyTitle: subject, // Use subject as title context
        subject: `Contact Form: ${subject}`,
        content: message,
        status: "unread",
        isAdminMessage: false,
        parentMessageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        source: "contact_form"
      }
      await messages.insertOne(messageEntry)
    } catch (msgError) {
      console.error("Failed to save contact to messages collection:", msgError)
      // Continue execution, don't fail the request
    }

    // Send email notifications
    const adminEmail = "mucerabdool@gmail.com"
    const emailSubject = `New Contact Form Submission: ${subject}`
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "N/A"}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
    
    // Send to Admin
    await sendEmail(adminEmail, emailSubject, emailHtml)
    
    // Send confirmation to User
    const userSubject = "We received your message"
    const userHtml = `
      <p>Hi ${name},</p>
      <p>Thank you for contacting us. We have received your message regarding "${subject}" and will get back to you shortly.</p>
      <br>
      <p>Best regards,</p>
      <p>The Team</p>
    `
    await sendEmail(email, userSubject, userHtml)

    return NextResponse.json({ id: result.insertedId, ...contact }, { status: 201 })
  } catch (error) {
    console.error("[v0] Contact submission error:", error)
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const db = await getDatabase()
    const contacts = db.collection("contacts")

    const results = await contacts.find({}).sort({ createdAt: -1 }).limit(limit).toArray()

    return NextResponse.json({ contacts: results })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}
