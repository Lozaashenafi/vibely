import { bot } from "../bot";

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, `/add — add a song\n/vibes — list vibes`, {
    parse_mode: "Markdown",
  });
});
