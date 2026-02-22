import dotenv from "dotenv";
dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });
import express from "express";
import cors from "cors";
import path from "path";
import { authRouter } from "./routes/auth";
import { debugRouter } from "./routes/debug";
import { postsRouter } from "./routes/posts";
import { likesRouter } from "./routes/likes";
import { commentsRouter } from "./routes/comments";
import { usersRouter } from "./routes/users";
import { quittingRouter } from "./routes/quitting";

export const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/debug", debugRouter);
app.use("/auth", authRouter);
app.use("/posts", postsRouter);
app.use("/likes", likesRouter);
app.use("/comments", commentsRouter);
app.use("/users", usersRouter);
app.use("/quitting", quittingRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});