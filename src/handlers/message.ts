import { bot } from "../bot";
import { getUser } from "../store/users";
import { downloadAudio } from "../services/downloader";
import fs from "fs";

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith("/")) return;
  const user = getUser(chatId);

  if (user.pendingVibe === "__WAITING__") {
    user.pendingVibe = text;
    user.vibes[text] = user.vibes[text] || [];
    bot.sendMessage(chatId, `✨ Vibe *${text}* selected.\nSend YouTube link`, {
      parse_mode: "Markdown",
    });
    return;
  }

  if (
    user.pendingVibe &&
    (text.includes("youtu.be") || text.includes("youtube.com"))
  ) {
    let statusMsg: any;

    try {
      statusMsg = await bot.sendMessage(chatId, "⏳ Processing audio...");

      const { filePath, title } = await downloadAudio(text);

      const stats = fs.statSync(filePath);
      if (stats.size / (1024 * 1024) > 49.5) {
        throw new Error("File is too big for Telegram (Max 50MB).");
      }

      // --- THE FIX IS HERE ---
      await bot.sendAudio(
        chatId,
        filePath,
        {
          // Argument 3: Message Options (Caption, Title, etc.)
          caption: `🎶 Added to *${user.pendingVibe}*`,
          parse_mode: "Markdown",
          title: title,
          performer: "Vibely Bot",
        },
        {
          // Argument 4: File Options (The fix for the warning)
          contentType: "audio/mpeg",
          filename: `${title}.mp3`,
        }
      );

      user.vibes[user.pendingVibe].push({
        url: text,
        addedAt: new Date(),
        title: title,
        filePath,
      });

      delete user.pendingVibe;
      bot.deleteMessage(chatId, statusMsg.message_id);
    } catch (error: any) {
      console.error("BOT ERROR:", error.message);
      if (statusMsg) bot.deleteMessage(chatId, statusMsg.message_id);
      bot.sendMessage(chatId, `❌ *Error:* ${error.message}`, {
        parse_mode: "Markdown",
      });
    }
  }
});
