import express from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { likePost, unlikePost, getLikes } from "../controllers/like.controller";

const router = express.Router();

router.post("/:postId", requireAuth, likePost);
router.delete("/:postId", requireAuth, unlikePost);
router.get("/:postId", requireAuth, getLikes);

export const likesRouter = router;