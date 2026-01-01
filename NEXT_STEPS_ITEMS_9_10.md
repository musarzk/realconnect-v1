# Next Steps - Items 9 & 10 Implementation Guide

## ✅ Current Status
- 8 out of 10 items completed and tested
- Build passing: ✅ Next.js 16.0.0 compilation successful
- All new endpoints and pages functional
- Input validation hardened
- Database indexes prepared

---

## 📋 Item #9: Booking Form Completion

### Current State
- Property detail page exists at `/app/property/[id]/page.tsx`
- Basic booking form with local state management
- Client-side validation only (toast notifications for missing fields)

### What Needs to Be Done

#### 1. Create Booking API Endpoint
**File:** `/api/bookings/route.ts` (likely exists, needs POST method)

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 2. Parse and validate request
    const body = await request.json()
    const validated = CreateBookingSchema.parse(body)

    // 3. Fetch property to verify it exists
    const db = await getDB()
    const properties = db.collection("properties")
    const property = await properties.findOne({ _id: new ObjectId(validated.propertyId) })
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 })

    // 4. Create booking document
    const bookings = db.collection("bookings")
    const booking = await bookings.insertOne({
      propertyId: new ObjectId(validated.propertyId),
      userId: new ObjectId(user.userId),
      checkIn: new Date(validated.checkIn),
      checkOut: new Date(validated.checkOut),
      guests: validated.guests,
      totalPrice: validated.totalPrice,
      notes: validated.notes || null,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // 5. Send confirmation notification (Item #10 later)
    // TODO: Emit notification event

    return NextResponse.json({ success: true, bookingId: booking.insertedId }, { status: 201 })
  } catch (error) {
    // Handle validation errors with Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
```

#### 2. Update Property Page to Call API

**File:** `/app/property/[id]/page.tsx`

Find `handleBookingSubmit` function and update:

```typescript
const handleBookingSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // Validate required fields
  if (!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.date || !bookingData.time) {
    toast({ title: "Missing Information", description: "Please fill in all fields.", variant: "destructive" })
    return
  }

  try {
    setIsBookingSubmitted(true)

    // Call API to create booking
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        propertyId: property._id || property.id,
        checkIn: new Date(`${bookingData.date}T${bookingData.time}`),
        checkOut: new Date(`${bookingData.date}T23:59:59`),
        guests: 1,
        totalPrice: property.price,
        notes: `Visit contact: ${bookingData.name} (${bookingData.phone})`,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Booking failed")
    }

    const data = await response.json()

    toast({
      title: "Visit Scheduled!",
      description: `Your tour has been scheduled. Booking ID: ${data.bookingId}`,
    })

    // Reset form
    setBookingData({ name: "", email: "", phone: "", date: "", time: "" })
  } catch (error) {
    toast({
      title: "Booking Failed",
      description: error.message,
      variant: "destructive",
    })
  } finally {
    setIsBookingSubmitted(false)
  }
}
```

#### 3. Create User Bookings History Page

**File:** `/app/dashboard/bookings/page.tsx` (new)

Similar pattern to listings page:
- GET `/api/dashboard/bookings?page=1&limit=10`
- Display user's bookings with status
- Show property info, dates, price
- Action buttons: View property, Cancel booking, Message agent

#### 4. Create API Endpoint for User's Bookings

**File:** `/api/dashboard/bookings/route.ts` (new)

```typescript
export async function GET(request: NextRequest) {
  // Fetch bookings where userId === authenticated user
  // Include property info via lookup
  // Return with pagination
}
```

---

## 📧 Item #10: Email Notification System

### Architecture Overview

```
Event → Notification Service → Email Queue → Email Provider → User Email
```

### Step 1: Choose Email Service

**Recommended:** SendGrid (free tier available)
```bash
npm install @sendgrid/mail
# or use Nodemailer for simpler setup
npm install nodemailer
```

### Step 2: Create Email Service

**File:** `/lib/email-service.ts` (new)

```typescript
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail", // or your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@dwelas.com",
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error("Email send failed:", error)
    return false
  }
}
```

### Step 3: Create Email Templates

**Files:** `/lib/email-templates/`

```typescript
// propertyApprovedTemplate.ts
export function propertyApprovedTemplate(propertyTitle: string) {
  return `
    <h2>Your property has been approved!</h2>
    <p>${propertyTitle} is now visible on Dwelas.</p>
    <a href="https://dwelas.com/property/[id]">View your listing</a>
  `
}

// bookingConfirmationTemplate.ts
export function bookingConfirmationTemplate(propertyTitle: string, checkIn: string, guests: number) {
  return `
    <h2>Booking Confirmed</h2>
    <p>Your booking for ${propertyTitle} is confirmed.</p>
    <p>Check-in: ${checkIn}</p>
    <p>Guests: ${guests}</p>
  `
}

// newMessageTemplate.ts
export function newMessageTemplate(senderName: string) {
  return `
    <h2>New Message</h2>
    <p>You have a new message from ${senderName}</p>
    <a href="https://dwelas.com/messages">View message</a>
  `
}

// welcomeTemplate.ts
export function welcomeTemplate(userName: string) {
  return `
    <h2>Welcome to Dwelas!</h2>
    <p>Welcome ${userName}! Start listing your properties today.</p>
    <a href="https://dwelas.com/list-property">Create your first listing</a>
  `
}
```

### Step 4: Create Notification Triggers

**Pattern:** Add email send to existing endpoints

**Example - Property Approval:**

```typescript
// /api/admin/properties/approval/route.ts (or in property update logic)
if (updateData.status === "approved" && previousStatus !== "approved") {
  // Get owner email
  const owner = await usersCollection.findOne({ _id: property.ownerId })
  
  // Send approval email
  await sendEmail(
    owner.email,
    "Your Property Has Been Approved",
    propertyApprovedTemplate(property.title)
  )
}
```

**Example - Booking Confirmation:**

```typescript
// /api/bookings/route.ts (POST method)
// After creating booking...
const user = await usersCollection.findOne({ _id: new ObjectId(user.userId) })
await sendEmail(
  user.email,
  "Booking Confirmation",
  bookingConfirmationTemplate(property.title, checkIn, guests)
)
```

### Step 5: Create Notification Records

**Store in Database:** Add to `/api/notifications/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { userId, type, title, body, relatedId } = await request.json()
  
  // Validate with schema
  const validated = CreateNotificationSchema.parse({...})
  
  // Store in database
  const notifications = db.collection("notifications")
  await notifications.insertOne({
    userId: new ObjectId(userId),
    type: validated.type,
    title: validated.title,
    body: validated.body,
    relatedId: validated.relatedId,
    read: false,
    createdAt: new Date(),
  })
  
  // Send email (based on type and user preference)
  await sendEmail(user.email, title, emailTemplate(body))
}
```

### Step 6: Email Triggers to Implement

| Event | Template | Trigger Point |
|-------|----------|---|
| User Registration | Welcome | `/api/auth/signup` POST |
| Property Approval | Approved | `/api/admin/properties` approval endpoint |
| Property Rejection | Rejected | `/api/admin/properties` rejection endpoint |
| Booking Received | New Booking | `/api/bookings` POST |
| Booking Confirmed | Confirmed | Agent confirms booking |
| Message Received | New Message | `/api/messages` POST |
| Property Inquiry | Inquiry | `/api/properties/[id]/inquire` POST |
| Agent Assignment | New Agent | Admin assigns to agent |

### Step 7: Environment Variables

Add to `.env.local`:

```
EMAIL_PROVIDER=sendgrid  # or nodemailer
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@dwelas.com
SENDGRID_API_KEY=your-sendgrid-key  # if using SendGrid
```

### Step 8: Create Notification Preferences Page

**File:** `/app/dashboard/settings/notifications/page.tsx` (new)

Users can toggle:
- Email on new booking
- Email on new message
- Email on property approval
- Email on inquiry received
- Daily digest

---

## Implementation Checklist

### Item #9: Booking Form
- [ ] Create POST `/api/bookings` endpoint
- [ ] Add validation using `CreateBookingSchema`
- [ ] Update `/app/property/[id]/page.tsx` form submission
- [ ] Create `/api/dashboard/bookings` GET endpoint
- [ ] Build `/app/dashboard/bookings` page
- [ ] Add "Cancel Booking" functionality
- [ ] Test booking flow end-to-end

### Item #10: Email System
- [ ] Install email package (Nodemailer or SendGrid)
- [ ] Create email service (`/lib/email-service.ts`)
- [ ] Create email templates (5-7 templates)
- [ ] Add email triggers to existing endpoints (6 trigger points)
- [ ] Create notification preference page
- [ ] Test email sends with real/test email
- [ ] Add unsubscribe link to emails

---

## Estimated Timeline

- **Item #9:** 2-3 hours
- **Item #10:** 3-4 hours
- **Testing:** 1-2 hours

**Total:** 6-9 hours to complete both items

---

## Testing Commands

```bash
# Build and test
pnpm build

# Run in development
pnpm dev

# Check types
pnpm tsc --noEmit

# After implementing Item #9, test booking creation:
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "66abc123...",
    "checkIn": "2025-01-15T14:00:00Z",
    "checkOut": "2025-01-16T11:00:00Z",
    "guests": 2,
    "totalPrice": 50000
  }'

# Get user's bookings:
curl http://localhost:3000/api/dashboard/bookings
```

---

## Files Already in Place

- ✅ Property detail page: `/app/property/[id]/page.tsx`
- ✅ Booking schema: `/app/api/lib/schemavalidation/booking-schema.ts`
- ✅ API routes structure established
- ✅ Notification schema: `/app/api/lib/schemavalidation/booking-schema.ts`

## Ready to Implement
- ✅ All prerequisites complete
- ✅ Architecture patterns established
- ✅ Validation schemas ready
- ✅ Database collections ready

**Start with Item #9 first - it's simpler and enables user engagement testing!**
