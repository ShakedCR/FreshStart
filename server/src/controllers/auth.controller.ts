import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { UserModel } from "../models/User";

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(12)
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { username, password } = parsed.data;

  const existing = await UserModel.findOne({ username });
  if (existing) {
    return res.status(409).json({ error: "Username already taken" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ username, passwordHash });

  if (!user) {
    return res.status(500).json({ error: "Failed to create user" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "JWT_SECRET is missing" });
  }

  const token = jwt.sign(
    { userId: user._id.toString(), username: user.username },
    secret,
    { expiresIn: "7d" }
  );

  return res.status(201).json({
    token,
    user: { id: user._id.toString(), username: user.username }
  });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { username, password } = parsed.data;

  const user = await UserModel.findOne({ username });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "JWT_SECRET is missing" });
  }

  const token = jwt.sign(
    { userId: user._id.toString(), username: user.username },
    secret,
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    token,
    user: { id: user._id.toString(), username: user.username }
  });
}
