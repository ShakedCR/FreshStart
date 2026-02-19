import mongoose from "mongoose";
import { app } from "./app";



const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

async function start() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGO_URI is missing in .env");

  await mongoose.connect(mongoUri);
  console.log("✅ Mongo connected");

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
