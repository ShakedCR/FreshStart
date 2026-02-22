import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";

export const debugRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Debug
 *   description: Debug endpoints (development only)
 */

/**
 * @swagger
 * /debug/whoami:
 *   get:
 *     summary: Get current authenticated user info
 *     tags: [Debug]
 *     responses:
 *       200:
 *         description: Current user info returned
 *       401:
 *         description: Unauthorized
 */
debugRouter.get("/whoami", requireAuth, (req, res) => {
  return res.json({ user: (req as any).user });
});