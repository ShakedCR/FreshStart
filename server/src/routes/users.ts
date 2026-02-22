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

router.get("/:username", requireAuth, getProfile);
router.put("/me/update", requireAuth, upload.single("profileImage"), updateProfile);
router.get("/:username/posts", requireAuth, getUserPosts);

export const usersRouter = router;