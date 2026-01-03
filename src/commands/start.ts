import { bot } from "../bot";

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🎧 *Welcome to Vibely*\n\nOrganize your favorite YouTube music into custom vibes. Choose an option below to get started:",
    {
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: [
          [{ text: "➕ Add Music" }, { text: "🌊 My Vibes" }],
          [{ text: "❓ Help" }],
        ],
        resize_keyboard: true, // Makes the buttons fit the screen nicely
        one_time_keyboard: false, // Keeps the menu visible for easy navigation
      },
    }
  );
});
