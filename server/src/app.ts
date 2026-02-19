import "./config/env";
import express from "express";
import { authRouter } from "./routes/auth";
import { debugRouter } from "./routes/debug";


export const app = express();

app.use(express.json());
app.use("/debug", debugRouter);
app.use("/auth", authRouter);


app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
