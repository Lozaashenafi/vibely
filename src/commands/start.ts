import { bot } from "../bot";

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🎧 *Welcome to Vibely*\nSave YouTube songs into vibes 🌊",
    { parse_mode: "Markdown" }
  );
});
