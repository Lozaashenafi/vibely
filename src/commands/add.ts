import { bot } from "../bot";
import { getUser } from "../store/users";

// Listen for both the command and the main menu button
bot.onText(/\/add|➕ Add Music/, (msg) => {
  const chatId = msg.chat.id;
  const user = getUser(chatId);
  const vibes = Object.keys(user.vibes);

  if (vibes.length === 0) {
    bot.sendMessage(
      chatId,
      "🎧 You don't have any vibes yet.\n*Send a name* to create your first vibe (e.g., 'Chill' or 'Gym'):",
      { parse_mode: "Markdown" }
    );
    user.pendingVibe = "__WAITING__";
    return;
  }

  // Create buttons for each existing vibe
  const vibeButtons = vibes.map((vibe) => [
    {
      text: `🌊 ${vibe} (${user.vibes[vibe].length} songs)`,
      callback_data: `view_vibe:${vibe}`,
    },
  ]);

  bot.sendMessage(chatId, "✨ *Choose a vibe to manage or type a new name:*", {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        ...vibeButtons,
        [{ text: "➕ Create New Vibe", callback_data: "new_vibe" }],
      ],
    },
  });
});

// Handle the button clicks
bot.on("callback_query", (query) => {
  const chatId = query.message?.chat.id;
  if (!chatId) return;

  const user = getUser(chatId);
  const data = query.data || "";

  bot.answerCallbackQuery(query.id);

  // 1. Show the collection and the "Add Music" button
  if (data.startsWith("view_vibe:")) {
    const vibeName = data.split(":")[1];
    const songs = user.vibes[vibeName] || [];

    let songList = songs.length
      ? songs
          .map((s, i) => `${i + 1}. ${s.title || "Unknown Title"}`)
          .join("\n")
      : "_Empty vibe..._";

    bot.sendMessage(chatId, `📂 *Collection: ${vibeName}*\n\n${songList}`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🎵 Add Song to this Vibe",
              callback_data: `vibe_add:${vibeName}`,
            },
          ],
          [{ text: "⬅️ Back to List", callback_data: "back_to_add" }],
        ],
      },
    });
  }

  // 2. Trigger the link request for a specific vibe
  if (data.startsWith("vibe_add:")) {
    const vibeName = data.split(":")[1];
    user.pendingVibe = vibeName;
    bot.sendMessage(
      chatId,
      `🎸 Ready! Send me a *YouTube link* to add to *${vibeName}*:`,
      {
        parse_mode: "Markdown",
      }
    );
  }

  // 3. Back/New logic
  if (data === "new_vibe" || data === "back_to_add") {
    bot.sendMessage(chatId, "🎧 Send a name to create a new vibe:");
    user.pendingVibe = "__WAITING__";
  }
});
