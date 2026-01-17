import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import http from "http";

dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN missing");
// Create a simple server that does nothing but stay alive for Render
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running!");
});

// Use the port Render gives us, or 8080 locally
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Keep-alive server is listening on port ${PORT}`);
});

export const bot = new TelegramBot(token, { polling: true });
