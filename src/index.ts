import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./store/db";
import { syncRegistry } from "./store/users";

// Import your commands
import "./commands/start";
import "./commands/help";
import "./commands/add";
import "./commands/vibes";
import "./handlers/message";

async function startApp() {
  try {
    // 1. Connect to MongoDB Atlas
    await connectDB();

    // 2. Load all shared vibes into memory for the share links
    await syncRegistry();

    console.log("🎶 Vibely bot is online and database is connected!");
  } catch (error) {
    console.error("💥 Failed to start app:", error);
    process.exit(1);
  }
}

startApp();
