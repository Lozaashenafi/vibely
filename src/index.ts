// src/index.ts
import http from "http";
const PORT = process.env.PORT || 8080;
http
  .createServer((req, res) => {
    res.writeHead(200);
    res.end("Vibely is Awake!");
  })
  .listen(PORT, () => {
    console.log(`🚀 Keep-alive server listening on port ${PORT}`);
  });

// 2. LOG EVERYTHING
console.log("Checking environment variables...");
console.log("BOT_TOKEN exists:", !!process.env.BOT_TOKEN);
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
import { connectDB } from "./store/db";
import { syncRegistry } from "./store/users";
import { bot } from "./bot";

// Import handlers
import "./commands/start";
import "./commands/vibes";
import "./handlers/message";
import "./commands/add";

async function startApp() {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("📦 MongoDB Connected!");

    await syncRegistry();
    console.log("🔄 Registry Synced!");

    console.log("🎶 Vibely bot is now listening for messages!");
  } catch (error: any) {
    console.error("💥 STARTUP ERROR:", error.message);
  }
}

startApp();
