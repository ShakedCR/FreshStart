import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthUser = {
  userId: string;
  username: string;
};

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = header.slice("Bearer ".length).trim();

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "JWT_SECRET is missing" });
  }

  try {
    const payload = jwt.verify(token, secret) as {
      userId: string;
      username: string;
      iat?: number;
      exp?: number;
    };

    req.user = { userId: payload.userId, username: payload.username };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
