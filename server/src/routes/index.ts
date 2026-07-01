import { Router } from "express";
import { register, login } from "../controllers/auth.js";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { Withdrawal } from "../models/Withdrawal.js";
import { config } from "../config/index.js";

const router = Router();

// Auth
router.post("/auth/register", register);
router.post("/auth/login", login);

// Profile
router.get("/profile", authenticate, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
});

// Dashboard
router.get("/dashboard", authenticate, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId).select("-password");
  const today = new Date().toISOString().split("T")[0];
  const adCount = user?.dailyAdDate === today ? user.dailyAdCount : 0;
  const transactions = await Transaction.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(10);
  res.json({ user, dailyAdCount: adCount, dailyLimit: config.dailyAdLimit, transactions });
});

// Watch Ad
router.post("/ads/watch", authenticate, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.isBanned) return res.status(403).json({ error: "Account banned" });

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Reset daily counter
  if (user.dailyAdDate !== today) {
    user.dailyAdCount = 0;
    user.dailyAdDate = today;
  }

  if (user.dailyAdCount >= config.dailyAdLimit) {
    return res.status(429).json({ error: "Daily ad limit reached" });
  }

  const reward = 0.02; // $0.02 per ad
  user.balance += reward;
  user.totalEarned += reward;
  user.adsWatched += 1;
  user.dailyAdCount += 1;
  user.lastAdAt = now;
  await user.save();

  await Transaction.create({
    userId: user._id,
    type: "ad_reward",
    amount: reward,
    description: `Ad #${user.adsWatched}`,
  });

  res.json({ balance: user.balance, adsWatched: user.adsWatched, dailyAdCount: user.dailyAdCount });
});

// Withdrawals
router.post("/withdrawals", authenticate, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { method, amount, accountDetails } = req.body;

  if (amount < config.minWithdrawal) {
    return res.status(400).json({ error: `Minimum withdrawal: $${config.minWithdrawal}` });
  }
  if (amount > user.balance) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  const fee = amount * 0.05; // 5% fee
  user.balance -= amount;
  await user.save();

  const withdrawal = await Withdrawal.create({
    userId: user._id,
    method,
    amount,
    fee,
    accountDetails,
  });

  await Transaction.create({
    userId: user._id,
    type: "withdrawal",
    amount: -amount,
    status: "pending",
    description: `Withdrawal via ${method}`,
  });

  res.status(201).json(withdrawal);
});

router.get("/withdrawals", authenticate, async (req: AuthRequest, res) => {
  const withdrawals = await Withdrawal.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(withdrawals);
});

// Referrals
router.get("/referrals", authenticate, async (req: AuthRequest, res) => {
  const referrals = await User.find({ referredBy: req.userId }).select("name email createdAt");
  res.json(referrals);
});

// Admin routes
router.get("/admin/users", authenticate, requireAdmin, async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

router.patch("/admin/users/:id", authenticate, requireAdmin, async (req, res) => {
  const updates = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
  res.json(user);
});

router.get("/admin/withdrawals", authenticate, requireAdmin, async (_req, res) => {
  const withdrawals = await Withdrawal.find().populate("userId", "email name").sort({ createdAt: -1 });
  res.json(withdrawals);
});

router.patch("/admin/withdrawals/:id", authenticate, requireAdmin, async (req, res) => {
  const { status, adminNote } = req.body;
  const withdrawal = await Withdrawal.findByIdAndUpdate(
    req.params.id, { status, adminNote }, { new: true }
  );

  // Refund if rejected
  if (status === "rejected" || status === "refunded") {
    const w = await Withdrawal.findById(req.params.id);
    if (w) {
      await User.findByIdAndUpdate(w.userId, { $inc: { balance: w.amount } });
    }
  }

  res.json(withdrawal);
});

router.get("/admin/stats", authenticate, requireAdmin, async (_req, res) => {
  const totalUsers = await User.countDocuments();
  const totalWithdrawals = await Withdrawal.countDocuments({ status: "approved" });
  const totalRevenue = await Withdrawal.aggregate([
    { $match: { status: "approved" } },
    { $group: { _id: null, total: { $sum: "$fee" } } },
  ]);
  res.json({
    totalUsers,
    totalWithdrawals,
    totalRevenue: totalRevenue[0]?.total || 0,
    pendingWithdrawals: await Withdrawal.countDocuments({ status: "pending" }),
  });
});

export default router;
