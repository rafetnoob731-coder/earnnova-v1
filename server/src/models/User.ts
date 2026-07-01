import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  username: string;
  role: "user" | "admin";
  balance: number;
  totalEarned: number;
  adsWatched: number;
  isBanned: boolean;
  banExpires: Date | null;
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  referralEarnings: number;
  lastAdAt: Date | null;
  dailyAdCount: number;
  dailyAdDate: string;
  otpSecret: string | null;
  stripeAccountId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    balance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    adsWatched: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
    banExpires: { type: Date, default: null },
    referralCode: { type: String, unique: true },
    referredBy: { type: String, default: null },
    referralCount: { type: Number, default: 0 },
    referralEarnings: { type: Number, default: 0 },
    lastAdAt: { type: Date, default: null },
    dailyAdCount: { type: Number, default: 0 },
    dailyAdDate: { type: String, default: "" },
    otpSecret: { type: String, default: null },
    stripeAccountId: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.index({ referralCode: 1 });
userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
