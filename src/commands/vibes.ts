import { bot } from "../bot";
import { getUser } from "../store/users";

bot.onText(/\/vibes/, (msg) => {
  const user = getUser(msg.chat.id);
  const vibes = Object.keys(user.vibes);

  if (!vibes.length) {
    bot.sendMessage(msg.chat.id, "No vibes yet 🌙");
    return;
  }

  bot.sendMessage(
    msg.chat.id,
    vibes.map((v) => `• ${v} (${user.vibes[v].length})`).join("\n")
  );
});
