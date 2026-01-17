// src/bot.ts
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN missing");

// Export only the bot. DO NOT start a server here.
export const bot = new TelegramBot(token, { polling: true });
