import mongoose, { Document, Model, models, model, Schema } from "mongoose";

export interface IInvestment {
  userId: mongoose.Types.ObjectId | string;
  propertyId: mongoose.Types.ObjectId | string;
  planId: string;
  amount: number;
  status: "pending" | "active" | "completed" | "cancelled";
  startDate: Date;
  endDate?: Date;
  returns: number;
  paymentSchedule?: {
    month: string;
    amount: number;
    status: "paid" | "pending";
  }[];
  documents?: {
    name: string;
    url: string;
    type: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IInvestmentDocument extends IInvestment, Document { }

const InvestmentSchema = new Schema<IInvestmentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    planId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    returns: { type: Number, default: 0 },
    paymentSchedule: [
      {
        month: String,
        amount: Number,
        status: {
          type: String,
          enum: ["paid", "pending"],
          default: "pending",
        },
      },
    ],
    documents: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Investment: Model<IInvestmentDocument> =
  (models.Investment as Model<IInvestmentDocument>) ||
  model<IInvestmentDocument>("Investment", InvestmentSchema);

export default Investment;
