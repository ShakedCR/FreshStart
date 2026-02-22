import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  getQuittingStats,
  getUserQuittingStats,
  startQuitting,
  stopQuitting,
  updateQuittingDate,
  getQuittingHistory,
  getUserQuittingHistory
} from "../controllers/quitting.controller";

export const quittingRouter = Router();

// Protected routes (for current user)
quittingRouter.get("/stats", requireAuth, getQuittingStats);
quittingRouter.post("/start", requireAuth, startQuitting);
quittingRouter.post("/stop", requireAuth, stopQuitting);
quittingRouter.put("/update-date", requireAuth, updateQuittingDate);
quittingRouter.get("/history", requireAuth, getQuittingHistory);

// Public routes (for any user)
quittingRouter.get("/:userId/stats", getUserQuittingStats);
quittingRouter.get("/:userId/history", getUserQuittingHistory);
