import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const execPromise = promisify(exec);
const YTDLP_PATH = "yt-dlp";

export async function downloadAudio(
  url: string,
): Promise<{ filePath: string; title: string; thumbPath?: string }> {
  const downloadsDir = path.resolve("downloads");
  if (!fs.existsSync(downloadsDir))
    fs.mkdirSync(downloadsDir, { recursive: true });

  const cookiesPath = path.resolve("cookies.txt");
  const cookiesArg = fs.existsSync(cookiesPath)
    ? `--cookies "${cookiesPath}"`
    : "";

  // THE NEW BYPASS STRATEGY:
  // 1. We use the 'android' player client (less likely to be blocked than 'web')
  // 2. We add a real browser User-Agent
  // 3. We force IPv4 because YouTube often blocks IPv6 ranges from data centers
  const command = `${YTDLP_PATH} ${cookiesArg} \
    --force-ipv4 \
    --user-agent "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36" \
    --extractor-args "youtube:player_client=android,web;player_skip=webpage,configs" \
    -x --audio-format mp3 --no-playlist --no-warnings \
    --write-thumbnail --convert-thumbnails jpg \
    --print "title" --print "after_move:filepath" \
    -o "${downloadsDir}/%(id)s.%(ext)s" "${url}"`;

  try {
    console.log("🚀 Attempting download with Android Client bypass...");
    // Use a long timeout
    const { stdout } = await execPromise(command, { timeout: 240000 });

    const lines = stdout
      .trim()
      .split("\n")
      .filter((l) => l.trim() !== "");
    const filePath = lines[lines.length - 1]?.trim();
    const title = lines[lines.length - 2]?.trim() || "Unknown Title";

    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error("File was not created by yt-dlp.");
    }

    const thumbPath = filePath.replace(".mp3", ".jpg");
    return {
      filePath,
      title,
      thumbPath: fs.existsSync(thumbPath) ? thumbPath : undefined,
    };
  } catch (error: any) {
    console.error("❌ YT-DLP CRITICAL ERROR:", error.message);

    // If it still says "Empty file" or "Sign in", the cookies.txt is likely expired or blocked
    if (error.message.includes("Sign in") || error.message.includes("empty")) {
      throw new Error(
        "YouTube has blocked the server IP. Try a different link or wait 10 minutes.",
      );
    }

    throw new Error(`Download failed: ${error.message}`);
  }
}
