import mongoose, { Document, Model, models, model, Schema } from "mongoose";

export interface ITransaction {
  userId: mongoose.Types.ObjectId | string;
  type: "deposit" | "investment" | "withdrawal" | "dividend";
  amount: number;
  status: "pending" | "success" | "failed";
  reference: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITransactionDocument extends ITransaction, Document {}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["deposit", "investment", "withdrawal", "dividend"],
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    reference: { type: String, required: true, unique: true },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

const Transaction: Model<ITransactionDocument> =
  (models.Transaction as Model<ITransactionDocument>) ||
  model<ITransactionDocument>("Transaction", TransactionSchema);

export default Transaction;
