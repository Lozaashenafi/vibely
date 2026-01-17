import { bot } from "../bot";

bot.onText(/\/add|➕ Add Music/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🎵 *Ready!* Paste a YouTube link here to add it to your vibes:",
    {
      parse_mode: "Markdown",
    },
  );
});
