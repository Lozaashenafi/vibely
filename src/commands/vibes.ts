import { bot } from "../bot";
import { getUser, saveUser, sharedVibes } from "../store/users";

// 1. Listen for the command - Made the function ASYNC
bot.onText(/\/vibes|🌊 My Vibes/, async (msg) => {
  const chatId = msg.chat.id;

  // Added AWAIT
  const user = await getUser(chatId);

  // Mongoose Maps work differently than regular objects.
  // We check if it's a Map and get the names accordingly.
  const vibeNames =
    user.vibes instanceof Map
      ? Array.from(user.vibes.keys())
      : Object.keys(user.vibes);

  const buttons = vibeNames.map((name) => {
    // Get the vibe object based on whether it's a Map or Object
    const vibe =
      user.vibes instanceof Map ? user.vibes.get(name) : user.vibes[name];
    return [
      {
        text: `${name} (${vibe.songs.length} 🎵)`,
        callback_data: `manage_vibe:${name}`,
      },
    ];
  });

  // Add the "Create New Vibe" button at the end
  buttons.push([
    { text: "➕ Create New Vibe", callback_data: "create_new_vibe" },
  ]);

  bot.sendMessage(chatId, "🗂️ *Your Vibes Library*", {
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: buttons },
  });
});

bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat.id;
  if (!chatId || !query.data) return;

  // Added AWAIT
  const user = await getUser(chatId);

  // Logic for Creating a Vibe
  if (query.data === "create_new_vibe") {
    // Update state in MongoDB
    await saveUser(chatId, { state: "WAITING_FOR_VIBE_NAME" });

    bot.answerCallbackQuery(query.id);
    return bot.sendMessage(
      chatId,
      "🏷️ *Type a name* for your new vibe collection (e.g., 'Workout' or 'Study'):",
      { parse_mode: "Markdown" },
    );
  }

  // Manage a specific Vibe
  if (query.data.startsWith("manage_vibe:")) {
    const name = query.data.split(":")[1];
    const vibe =
      user.vibes instanceof Map ? user.vibes.get(name) : user.vibes[name];

    if (!vibe)
      return bot.answerCallbackQuery(query.id, { text: "Vibe not found" });

    const botUsername = "vibely_music_bot"; // Ensure this matches your BotFather username
    const shareLink = `https://t.me/${botUsername}?start=${vibe.id}`;
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(`Check out my ${name} vibe on Vibely!`)}`;

    bot.sendMessage(chatId, `🌊 *Vibe: ${name}*\nSongs: ${vibe.songs.length}`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "▶️ Play All", callback_data: `play:${vibe.id}:0` }],
          [{ text: "🔗 Share with Friends", url: telegramShareUrl }],
        ],
      },
    });
  }

  // Playback logic (Sequential & Social-Ready)
  if (query.data.startsWith("play:")) {
    const [_, vibeId, indexStr] = query.data.split(":");
    const index = parseInt(indexStr);

    // Look up the vibe in the shared registry (to support both own and shared vibes)
    const info = sharedVibes[vibeId];
    if (!info)
      return bot.answerCallbackQuery(query.id, { text: "Vibe ID not found" });

    const owner = await getUser(info.ownerId);
    const vibe =
      owner.vibes instanceof Map
        ? owner.vibes.get(info.vibeName)
        : owner.vibes[info.vibeName];

    if (!vibe || !vibe.songs[index]) {
      return bot.answerCallbackQuery(query.id, { text: "End of the vibe! 🌙" });
    }

    const song = vibe.songs[index];
    const isLast = index === vibe.songs.length - 1;

    bot.answerCallbackQuery(query.id);

    await bot.sendAudio(chatId, song.telegramFileId || song.url, {
      caption: `🎵 ${index + 1}/${vibe.songs.length} — *${vibe.name}*`,
      parse_mode: "Markdown",
      reply_markup: isLast
        ? undefined
        : {
            inline_keyboard: [
              [
                {
                  text: "Next Song ⏭️",
                  callback_data: `play:${vibeId}:${index + 1}`,
                },
              ],
            ],
          },
    });
  }
});
