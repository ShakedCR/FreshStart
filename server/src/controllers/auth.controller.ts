import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { UserModel } from "../models/User";
import { RefreshTokenModel } from "../models/RefreshToken";

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(12)
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

async function generateTokens(userId: string, username: string) {
  const accessSecret = process.env.JWT_SECRET || "temp_secret_123";
  const refreshSecret = process.env.JWT_REFRESH_SECRET || "temp_refresh_456";

  const accessToken = jwt.sign(
    { userId, username },
    accessSecret,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId, username },
    refreshSecret,
    { expiresIn: "7d" }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshTokenModel.create({
    token: refreshToken,
    userId,
    expiresAt
  });

  return { accessToken, refreshToken };
}

export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const { username, password } = parsed.data;
    const existing = await UserModel.findOne({ username });
    if (existing) return res.status(409).json({ error: "Username already taken" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ username, passwordHash });

    const { accessToken, refreshToken } = await generateTokens(user._id.toString(), user.username);

    return res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user._id.toString(), username: user.username, profileImage: user.profileImage || "" }
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const { username, password } = parsed.data;
    const user = await UserModel.findOne({ username });
    if (!user || !user.passwordHash) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const { accessToken, refreshToken } = await generateTokens(user._id.toString(), user.username);

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: { id: user._id.toString(), username: user.username, profileImage: user.profileImage || "" }
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function googleLogin(req: Request, res: Response) {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "Google token required" });

    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${credential}`);
    const payload = await response.json();

    if (!payload.email) return res.status(400).json({ error: "Invalid Google token" });

    let user = await UserModel.findOne({ googleId: payload.sub });

    if (!user) {
      user = await UserModel.create({
        username: payload.email,
        googleId: payload.sub
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user._id.toString(), user.username);

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: { id: user._id.toString(), username: user.username, profileImage: user.profileImage || "" }
    });
  } catch (err) {
    return res.status(400).json({ error: "Google authentication failed" });
  }
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

  const storedToken = await RefreshTokenModel.findOne({ token: refreshToken });
  if (!storedToken) return res.status(401).json({ error: "Invalid refresh token" });

  try {
    const secret = process.env.JWT_REFRESH_SECRET || "temp_refresh_456";
    const payload = jwt.verify(refreshToken, secret) as any;

    const newAccessToken = jwt.sign(
      { userId: payload.userId, username: payload.username },
      process.env.JWT_SECRET || "temp_secret_123",
      { expiresIn: "15m" }
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

    await RefreshTokenModel.deleteOne({ token: refreshToken });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}