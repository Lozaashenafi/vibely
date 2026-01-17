// src/index.ts
import http from "http";
import dotenv from "dotenv";
dotenv.config();

// 1. START THE SERVER ONLY ONCE
const PORT = process.env.PORT || 10000;
http
  .createServer((req, res) => {
    res.writeHead(200);
    res.end("Vibely is Awake!");
  })
  .listen(PORT, () => {
    console.log(`🚀 Keep-alive server listening on port ${PORT}`);
  });

import { connectDB } from "./store/db";
import { syncRegistry } from "./store/users";
import { bot } from "./bot";

// 2. IMPORT ALL HANDLERS (This makes your buttons work!)
import "./commands/start";
import "./commands/vibes";
import "./commands/add";
import "./handlers/message";

async function startApp() {
  try {
    console.log("Checking environment variables...");
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
