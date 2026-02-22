import express from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { likePost, unlikePost, getLikes } from "../controllers/like.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: Likes endpoints
 */

/**
 * @swagger
 * /likes/{postId}:
 *   post:
 *     summary: Like a post
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Post liked successfully
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Already liked
 */
router.post("/:postId", requireAuth, likePost);

/**
 * @swagger
 * /likes/{postId}:
 *   delete:
 *     summary: Unlike a post
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post unliked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Like not found
 */
router.delete("/:postId", requireAuth, unlikePost);

/**
 * @swagger
 * /likes/{postId}:
 *   get:
 *     summary: Get likes count and status for a post
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns count and liked status
 *       401:
 *         description: Unauthorized
 */
router.get("/:postId", requireAuth, getLikes);

export const likesRouter = router;