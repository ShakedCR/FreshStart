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

router.post("/", requireAuth, upload.single("image"), createPost);
router.get("/feed", requireAuth, getFeed);
router.put("/:id", requireAuth, upload.single("image"), editPost);
router.delete("/:id", requireAuth, deletePost);

export const postsRouter = router;