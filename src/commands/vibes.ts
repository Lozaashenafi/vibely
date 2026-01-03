import { bot } from "../bot";
import { getUser } from "../store/users";

// Listen for both the command and the button text from /start
bot.onText(/\/vibes|🌊 My Vibes/, (msg) => {
  const chatId = msg.chat.id;
  const user = getUser(chatId);
  const vibeNames = Object.keys(user.vibes);

  const header = "🌊 *Your Music Vibes*\n\n";
  const list = vibeNames.length
    ? vibeNames.map((v) => `• ${v} (${user.vibes[v].length} songs)`).join("\n")
    : "No vibes yet 🌙. Create your first collection!";

  bot.sendMessage(chatId, header + list, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "➕ Add New Song / Vibe", callback_data: "trigger_add" }],
      ],
    },
  });
});

// Handle the button click
bot.on("callback_query", (query) => {
  if (query.data === "trigger_add") {
    const chatId = query.message?.chat.id;
    if (!chatId) return;

    bot.answerCallbackQuery(query.id);
    const user = getUser(chatId);
    const vibes = Object.keys(user.vibes);

    bot.sendMessage(
      chatId,
      vibes.length
        ? `✨ *Current Vibes:* ${vibes.join(
            ", "
          )}\nType an existing name or a new one to continue:`
        : "🎧 Send a vibe name to create your first collection!",
      { parse_mode: "Markdown" }
    );

    user.pendingVibe = "__WAITING__";
  }
});
