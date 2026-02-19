import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";

export const debugRouter = Router();

debugRouter.get("/whoami", requireAuth, (req, res) => {
  return res.json({ user: (req as any).user });
});
