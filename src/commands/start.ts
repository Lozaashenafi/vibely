import { bot } from "../bot";
import { getUser, sharedVibes } from "../store/users";

bot.onText(/\/start ?(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const shareId = match?.[1];

  // If there is a shareId in the URL
  if (shareId && sharedVibes[shareId]) {
    const { ownerId, vibeName } = sharedVibes[shareId];
    const ownerData = getUser(ownerId);
    const vibe = (await ownerData).vibes[vibeName];

    return bot.sendMessage(
      chatId,
      `🎧 *You found a shared vibe!*\n\n*Vibe:* ${vibeName}\n*Curator:* ${msg.from?.first_name || "A friend"}\n*Songs:* ${vibe.songs.length}`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            // Note: We use the universal 'play' prefix
            [{ text: "▶️ Listen Now", callback_data: `play:${shareId}:0` }],
            [
              {
                text: "📥 Add to My Vibes",
                callback_data: `import:${shareId}`,
              },
            ],
          ],
        },
      },
    );
  }

  // Normal Welcome message
  bot.sendMessage(chatId, "🎧 *Welcome to Vibely*", {
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: [[{ text: "➕ Add Music" }, { text: "🌊 My Vibes" }]],
      resize_keyboard: true,
    },
  });
});
