import { bot } from "../bot";
import { downloadAudio } from "../services/downloader";
import { v4 as uuidv4 } from "uuid";
// Note: Changed saveData to saveUser
import { getUser, saveUser, sharedVibes } from "../store/users";

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (!text || text.startsWith("/")) return;

  // IMPORTANT: Added 'await' because getUser is now async
  const user = await getUser(chatId);

  // Flow A: User sent a YouTube Link
  if (text.includes("youtu.be") || text.includes("youtube.com")) {
    // Save to MongoDB
    await saveUser(chatId, { pendingLink: text });

    // In MongoDB, vibes is often a Map, so we use Object.keys if it's a plain object
    // or Array.from(user.vibes.keys()) if it's a Mongoose Map.
    const vibes =
      user.vibes instanceof Map
        ? Array.from(user.vibes.keys())
        : Object.keys(user.vibes);

    const vibeButtons = vibes.map((name) => [
      { text: `🌊 ${name}`, callback_data: `sel_vibe:${name}` },
    ]);

    return bot.sendMessage(chatId, "✨ *Select a vibe for this song:*", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          ...vibeButtons,
          [{ text: "➕ Create New Vibe", callback_data: "create_new_vibe" }],
        ],
      },
    });
  }

  // Flow B: User typed a name for a new vibe
  if (user.state === "WAITING_FOR_VIBE_NAME") {
    const newName = text.trim();
    const id = uuidv4();

    // Add the new vibe to the local object
    user.vibes[newName] = { id, name: newName, songs: [] };

    // Register for sharing
    sharedVibes[id] = { ownerId: chatId, vibeName: newName };

    // Save the updated vibes and clear state in MongoDB
    await saveUser(chatId, {
      vibes: user.vibes,
      state: undefined,
    });

    bot.sendMessage(
      chatId,
      `✅ Vibe *${newName}* created! Now paste your link again to add music.`,
      { parse_mode: "Markdown" },
    );
  }
});

bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat.id;
  if (!chatId || !query.data) return;

  // IMPORTANT: Added 'await'
  const user = await getUser(chatId);

  // --- 1. NEW SONG SELECTION LOGIC ---
  if (query.data.startsWith("sel_vibe:")) {
    const vibeName = query.data.split(":")[1];
    const url = user.pendingLink;

    if (!url) {
      return bot.answerCallbackQuery(query.id, {
        text: "Error: No link found.",
      });
    }

    bot.answerCallbackQuery(query.id, { text: "Downloading..." });
    const statusMsg = await bot.sendMessage(
      chatId,
      `⏳ Adding to *${vibeName}*...`,
    );

    try {
      const { filePath, title } = await downloadAudio(url);

      const sentAudio = await bot.sendAudio(chatId, filePath, {
        caption: `✅ Added to *${vibeName}*`,
        title: title,
        performer: "Vibely",
      });

      // Update the song list
      user.vibes[vibeName].songs.push({
        url,
        title,
        addedAt: new Date(),
        telegramFileId: sentAudio.audio?.file_id,
      });

      // Save updated vibes to MongoDB and clear the pending link
      await saveUser(chatId, {
        vibes: user.vibes,
        pendingLink: undefined,
      });

      bot.deleteMessage(chatId, statusMsg.message_id);
    } catch (error) {
      bot.sendMessage(chatId, "❌ Failed to process link.");
    }
  }

  // --- 2. UNIVERSAL PLAY LOGIC ---
  if (query.data.startsWith("play:")) {
    const [_, vibeId, indexStr] = query.data.split(":");
    const index = parseInt(indexStr);

    const info = sharedVibes[vibeId];
    if (!info)
      return bot.answerCallbackQuery(query.id, { text: "Vibe not found" });

    // IMPORTANT: owner lookup is now async
    const owner = await getUser(info.ownerId);
    const vibe = owner.vibes[info.vibeName];
    const song = vibe.songs[index];

    if (!song)
      return bot.answerCallbackQuery(query.id, { text: "End of vibe!" });

    bot.answerCallbackQuery(query.id);
    await bot.sendAudio(chatId, song.telegramFileId || song.url, {
      caption: `🎵 ${index + 1}/${vibe.songs.length} — *${vibe.name}*`,
      reply_markup:
        index < vibe.songs.length - 1
          ? {
              inline_keyboard: [
                [
                  {
                    text: "Next Song ⏭️",
                    callback_data: `play:${vibeId}:${index + 1}`,
                  },
                ],
              ],
            }
          : undefined,
    });
  }

  // --- 3. CREATE NEW VIBE BUTTON ---
  if (query.data === "create_new_vibe") {
    await saveUser(chatId, { state: "WAITING_FOR_VIBE_NAME" });
    bot.answerCallbackQuery(query.id);
    bot.sendMessage(chatId, "🏷️ *Type the name* for your new vibe:");
  }

  // --- 4. IMPORT LOGIC ---
  if (query.data.startsWith("import:")) {
    const shareId = query.data.split(":")[1];
    const info = sharedVibes[shareId];
    if (!info) return;

    const owner = await getUser(info.ownerId);
    const originalVibe = owner.vibes[info.vibeName];

    const newName = `${info.vibeName} (Imported)`;
    const newId = uuidv4();

    user.vibes[newName] = {
      id: newId,
      name: newName,
      songs: [...originalVibe.songs],
    };

    sharedVibes[newId] = { ownerId: chatId, vibeName: newName };

    // Save to MongoDB
    await saveUser(chatId, { vibes: user.vibes });

    bot.answerCallbackQuery(query.id, { text: "Added to library!" });
    bot.sendMessage(chatId, `✅ *${newName}* added.`);
  }
});
