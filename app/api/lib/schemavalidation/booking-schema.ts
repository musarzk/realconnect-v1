import { z } from "zod"

export const BookingStatusZ = z.enum(["pending", "confirmed", "cancelled", "completed"])

export const CreateBookingSchema = z.object({
  propertyId: z.string().min(24, "Invalid property ID"),
  checkIn: z.string().datetime("Invalid check-in date"),
  checkOut: z.string().datetime("Invalid check-out date"),
  guests: z.number().int().min(1, "At least 1 guest required"),
  totalPrice: z.number().nonnegative("Price must be non-negative"),
  notes: z.string().max(500).optional().nullable().default(null),
})

export const UpdateBookingSchema = CreateBookingSchema.partial().extend({
  status: BookingStatusZ.optional(),
})

export const BookingStatusUpdateSchema = z.object({
  status: BookingStatusZ,
})

export const CreateMessageSchema = z.object({
  receiverId: z.string().min(24, "Invalid receiver ID"),
  subject: z.string().min(1, "Subject required").max(100),
  body: z.string().min(1, "Message body required").max(5000),
})

export const ReplyMessageSchema = z.object({
  body: z.string().min(1, "Reply body required").max(5000),
})

export const CreateNotificationSchema = z.object({
  userId: z.string().min(24, "Invalid user ID"),
  type: z.enum(["booking", "message", "listing", "system", "approval"]),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  relatedId: z.string().optional().nullable().default(null),
})

export const ContactFormSchema = z.object({
  name: z.string().min(1, "Name required").max(100),
  email: z.string().email("Invalid email"),
  phone: z.string().min(5, "Invalid phone"),
  subject: z.string().min(1, "Subject required").max(100),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
})

export type CreateBooking = z.infer<typeof CreateBookingSchema>
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>
export type BookingStatus = z.infer<typeof BookingStatusZ>
export type CreateMessage = z.infer<typeof CreateMessageSchema>
export type ReplyMessage = z.infer<typeof ReplyMessageSchema>
export type CreateNotification = z.infer<typeof CreateNotificationSchema>
export type ContactForm = z.infer<typeof ContactFormSchema>
