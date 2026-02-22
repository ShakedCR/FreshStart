import express from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../middleware/auth.middleware";
import { createPost, getFeed, editPost, deletePost } from "../controllers/post.controller";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const isValid = allowed.test(path.extname(file.originalname).toLowerCase());
    isValid ? cb(null, true) : cb(new Error("Only images allowed"));
  }
});

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Posts endpoints
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Text is required
 *       401:
 *         description: Unauthorized
 */
router.post("/", requireAuth, upload.single("image"), createPost);

/**
 * @swagger
 * /posts/feed:
 *   get:
 *     summary: Get paginated feed of posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts to return
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination (last post _id)
 *     responses:
 *       200:
 *         description: List of posts with nextCursor
 *       401:
 *         description: Unauthorized
 */
router.get("/feed", requireAuth, getFeed);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Edit a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               removeImage:
 *                 type: string
 *                 enum: ["true"]
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Post not found
 */
router.put("/:id", requireAuth, upload.single("image"), editPost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Post not found
 */
router.delete("/:id", requireAuth, deletePost);

export const postsRouter = router;