import express from "express";
import { register, login, refresh, logout, googleLogin } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/google", googleLogin); 

export const authRouter = router;