import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("BOT_TOKEN is missing");
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "🎧 Welcome to *Vibely*\n\nSave your favorite YouTube songs, organize your vibes, and share the mood.\n\nType /help to see what I can do 🌊",
    { parse_mode: "Markdown" }
  );
});

console.log("Vibely bot is running 🎶");
