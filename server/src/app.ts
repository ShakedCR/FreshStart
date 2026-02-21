import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { authRouter } from "./routes/auth";
import { debugRouter } from "./routes/debug";
import { postsRouter } from "./routes/posts";

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

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});