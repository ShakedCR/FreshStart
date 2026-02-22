import express from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { addComment, getComments, deleteComment } from "../controllers/comment.controller";

const router = express.Router();

router.post("/:postId", requireAuth, addComment);
router.get("/:postId", requireAuth, getComments);
router.delete("/:commentId", requireAuth, deleteComment);

export const commentsRouter = router;