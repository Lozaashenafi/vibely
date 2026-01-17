// src/index.ts
import "./bot";
import { connectDB } from "./store/db";
import { syncRegistry } from "./store/users";

// Import handlers
import "./commands/start";
import "./commands/vibes";
import "./handlers/message";

async function startApp() {
  try {
    // 1. Connect to MongoDB Atlas
    await connectDB();

    // 2. Load shared vibes
    await syncRegistry();

    console.log("🎶 Vibely bot is online!");
  } catch (error) {
    console.error("💥 Startup Error:", error);
  }
}

startApp();
