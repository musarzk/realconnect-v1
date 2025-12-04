import mongoose, { Document, Model, models, model, Schema } from "mongoose";

export interface IWallet {
  userId: mongoose.Types.ObjectId | string;
  balance: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWalletDocument extends IWallet, Document {}

const WalletSchema = new Schema<IWalletDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
  },
  {
    timestamps: true,
  }
);

const Wallet: Model<IWalletDocument> =
  (models.Wallet as Model<IWalletDocument>) ||
  model<IWalletDocument>("Wallet", WalletSchema);

export default Wallet;
