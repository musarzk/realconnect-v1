// models/User.ts
import mongoose, { Document, Model, models, model, Schema, Types } from "mongoose";

/**
 * IUser - plain TS type used elsewhere
 * Keep fields optional where appropriate so partial updates work cleanly.
 */
export type IUser = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: "user" | "agent" | "admin" | "investor" | string;
  approved?: boolean;
  favorites?: Types.ObjectId[] | string[];
  phone?: string | null;
  bio?: string | null;
  company?: string | null;
  specialization?: string | null;
  location?: string | null;
  avatar?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * IUserDocument - mongoose Document + IUser
 */
export interface IUserDocument extends IUser, Document {}

/**
 * Schema definition
 */
const UserSchema = new Schema<IUserDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "agent", "admin", "investor"],
      default: "user",
    },

    // Admin / moderation
    approved: { type: Boolean, default: false },

    // Profile fields
    phone: { type: String, default: null },
    bio: { type: String, default: null },
    company: { type: String, default: null },
    specialization: { type: String, default: null },
    location: { type: String, default: null },
    avatar: { type: String, default: null },

    // Relations
    favorites: [{ type: Schema.Types.ObjectId, ref: "Property" }],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        // Cast `ret` to any for safe mutation in transform —
        // this avoids TypeScript errors about `delete` and missing `id` prop.
        const out = ret as any;

        // remove sensitive fields when serializing
        if (out && typeof out === "object") {
          delete out.password;
        }

        // convert _id to id for convenience
        try {
          if (out && out._id) {
            out.id = out._id?.toString?.() ?? String(out._id);
            delete out._id;
          }
        } catch {
          // noop — defensive
        }

        return out;
      },
    },
  }
);

/**
 * Prevent model overwrite on hot reload (Next.js dev)
 */
const User: Model<IUserDocument> =
  (models.User as Model<IUserDocument>) || model<IUserDocument>("User", UserSchema);

export default User;
