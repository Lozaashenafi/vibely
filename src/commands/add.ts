import { bot } from "../bot";
import { getUser } from "../store/users";

bot.onText(/\/add$/, (msg) => {
  const chatId = msg.chat.id;
  const user = getUser(chatId);

  const vibes = Object.keys(user.vibes);

  bot.sendMessage(
    chatId,
    vibes.length
      ? `Choose or type a vibe:\n${vibes.join("\n")}`
      : "Send a vibe name to create one 🎧"
  );

  user.pendingVibe = "__WAITING__";
});
