import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000"),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/earnnova",
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  jwtExpiry: process.env.JWT_EXPIRY || "7d",
  stripeSecret: process.env.STRIPE_SECRET_KEY || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",

  // Platform config
  dailyAdLimit: parseInt(process.env.DAILY_AD_LIMIT || "30"),
  adCooldownMs: parseInt(process.env.AD_COOLDOWN_MS || "600000"),
  referralBonus: parseFloat(process.env.REFERRAL_BONUS || "0.50"),
  minWithdrawal: parseFloat(process.env.MIN_WITHDRAWAL || "5.00"),
};
