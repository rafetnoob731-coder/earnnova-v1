import mongoose, { Document, Schema } from "mongoose";

export type WithdrawalMethod =
  | "bkash" | "nagad" | "binance" | "paypal"
  | "wise" | "bank" | "crypto";

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  method: WithdrawalMethod;
  amount: number;
  fee: number;
  accountDetails: Record<string, string>;
  status: "pending" | "approved" | "rejected" | "refunded";
  adminNote: string;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalSchema = new Schema<IWithdrawal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    method: {
      type: String,
      enum: ["bkash", "nagad", "binance", "paypal", "wise", "bank", "crypto"],
      required: true,
    },
    amount: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    accountDetails: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "refunded"],
      default: "pending",
    },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Withdrawal = mongoose.model<IWithdrawal>("Withdrawal", withdrawalSchema);
