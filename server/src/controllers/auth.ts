import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { nanoid } from "nanoid";
import { User } from "../models/User.js";
import { config } from "../config/index.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, referralCode } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);
    const refCode = nanoid(8).toUpperCase();

    const user = await User.create({
      email,
      password: hashed,
      name: name || email.split("@")[0],
      referralCode: refCode,
      referredBy: referralCode || null,
    });

    // Handle referral bonus
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referrer.referralCount += 1;
        referrer.referralEarnings += config.referralBonus;
        referrer.balance += config.referralBonus;
        await referrer.save();
      }
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry } as SignOptions
    );

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, balance: user.balance },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    if (user.isBanned) {
      if (user.banExpires && user.banExpires > new Date()) {
        return res.status(403).json({ error: "Account banned", banExpires: user.banExpires });
      }
      user.isBanned = false;
      user.banExpires = null;
      await user.save();
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry } as SignOptions
    );

    res.json({
      token,
      user: {
        id: user._id, email: user.email, name: user.name,
        role: user.role, balance: user.balance, referralCode: user.referralCode,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
