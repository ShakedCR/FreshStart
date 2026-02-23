import { Router } from "express";
import { searchPosts } from "../controllers/ai.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/search", requireAuth, searchPosts);

export { router as aiRouter };