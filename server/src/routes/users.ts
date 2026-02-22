import express from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getProfile, updateProfile, getUserPosts } from "../controllers/user.controller";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(file.mimetype));
  }
});

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile endpoints
 */

/**
 * @swagger
 * /users/{username}:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/:username", requireAuth, getProfile);

/**
 * @swagger
 * /users/me/update:
 *   put:
 *     summary: Update own profile
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Username already taken
 */
router.put("/me/update", requireAuth, upload.single("profileImage"), updateProfile);

/**
 * @swagger
 * /users/{username}/posts:
 *   get:
 *     summary: Get all posts by a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user posts
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/:username/posts", requireAuth, getUserPosts);

export const usersRouter = router;