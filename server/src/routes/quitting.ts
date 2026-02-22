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

/**
 * @swagger
 * tags:
 *   name: Quitting
 *   description: Smoking cessation tracking endpoints
 */

/**
 * @swagger
 * /quitting/stats:
 *   get:
 *     summary: Get current user's quitting stats
 *     tags: [Quitting]
 *     responses:
 *       200:
 *         description: Quitting stats returned successfully
 *       401:
 *         description: Unauthorized
 */
quittingRouter.get("/stats", requireAuth, getQuittingStats);

/**
 * @swagger
 * /quitting/start:
 *   post:
 *     summary: Start quitting smoking
 *     tags: [Quitting]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quitDate]
 *             properties:
 *               quitDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Quitting session started
 *       401:
 *         description: Unauthorized
 */
quittingRouter.post("/start", requireAuth, startQuitting);

/**
 * @swagger
 * /quitting/stop:
 *   post:
 *     summary: Stop current quitting session
 *     tags: [Quitting]
 *     responses:
 *       200:
 *         description: Quitting session stopped
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active quitting session
 */
quittingRouter.post("/stop", requireAuth, stopQuitting);

/**
 * @swagger
 * /quitting/update-date:
 *   put:
 *     summary: Update quit date
 *     tags: [Quitting]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quitDate]
 *             properties:
 *               quitDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Quit date updated
 *       401:
 *         description: Unauthorized
 */
quittingRouter.put("/update-date", requireAuth, updateQuittingDate);

/**
 * @swagger
 * /quitting/history:
 *   get:
 *     summary: Get current user's quitting history
 *     tags: [Quitting]
 *     responses:
 *       200:
 *         description: Quitting history returned
 *       401:
 *         description: Unauthorized
 */
quittingRouter.get("/history", requireAuth, getQuittingHistory);

/**
 * @swagger
 * /quitting/{userId}/stats:
 *   get:
 *     summary: Get any user's quitting stats
 *     tags: [Quitting]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User quitting stats returned
 *       404:
 *         description: User not found
 */
quittingRouter.get("/:userId/stats", getUserQuittingStats);

/**
 * @swagger
 * /quitting/{userId}/history:
 *   get:
 *     summary: Get any user's quitting history
 *     tags: [Quitting]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User quitting history returned
 *       404:
 *         description: User not found
 */
quittingRouter.get("/:userId/history", getUserQuittingHistory);