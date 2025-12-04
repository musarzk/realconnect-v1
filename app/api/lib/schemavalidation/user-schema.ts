import { z } from "zod"

export const RoleZ = z.enum(["user", "agent", "admin", "investor"])

export const UserProfileSchema = z.object({
  firstName: z.string().min(1, "First name required").max(50),
  lastName: z.string().min(1, "Last name required").max(50),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional().nullable().default(null),
  bio: z.string().max(500).optional().nullable().default(null),
  avatar: z.string().url().optional().nullable().default(null),
  location: z.string().optional().nullable().default(null),
  company: z.string().optional().nullable().default(null),
  specialization: z.string().optional().nullable().default(null),
})

export const UpdateProfileSchema = UserProfileSchema.partial()

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const SignupSchema = z
  .object({
    firstName: z.string().min(1, "First name required").max(50),
    lastName: z.string().min(1, "Last name required").max(50),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((v) => v === true, "Must agree to terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const UserRoleUpdateSchema = z.object({
  role: RoleZ,
})

export const UserApprovalSchema = z.object({
  approved: z.boolean(),
})

export const UserSuspensionSchema = z.object({
  suspended: z.boolean(),
})

export type UserProfile = z.infer<typeof UserProfileSchema>
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type SignupInput = z.infer<typeof SignupSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
export type UserRole = z.infer<typeof RoleZ>
