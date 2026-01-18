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

  // NEWEST BYPASS STRATEGY (Jan 2024):
  // 1. Pretend to be a Mobile Browser (mweb)
  // 2. Force IPv4 (Crucial for Render/Google Cloud IPs)
  // 3. Add a real Referer header
  const command = `${YTDLP_PATH} ${cookiesArg} \
    --force-ipv4 \
    --user-agent "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1" \
    --referer "https://www.youtube.com/" \
    --extractor-args "youtube:player_client=mweb,android;player_skip=webpage,configs" \
    -x --audio-format mp3 --no-playlist --no-warnings \
    --write-thumbnail --convert-thumbnails jpg \
    --print "title" --print "after_move:filepath" \
    -o "${downloadsDir}/%(id)s.%(ext)s" "${url}"`;

  try {
    console.log("🚀 Attempting Mobile-Web Bypass for:", url);
    const { stdout } = await execPromise(command, { timeout: 180000 });

    const lines = stdout
      .trim()
      .split("\n")
      .filter((l) => l.trim() !== "");
    const filePath = lines[lines.length - 1]?.trim();
    const title = lines[lines.length - 2]?.trim() || "Unknown Title";

    if (!filePath || !fs.existsSync(filePath))
      throw new Error("File not created");

    const thumbPath = filePath.replace(".mp3", ".jpg");
    return {
      filePath,
      title,
      thumbPath: fs.existsSync(thumbPath) ? thumbPath : undefined,
    };
  } catch (error: any) {
    console.error("❌ YT-DLP CRITICAL FAILURE:", error.message);

    // Check if the video is actually a 'Music' video (YouTube blocks these harder)
    if (error.message.includes("confirm you’re not a bot")) {
      throw new Error(
        "YouTube detected the Render Server. Try a different video or update cookies.txt.",
      );
    }
    throw new Error(`YouTube Error: ${error.message.split("\n")[0]}`);
  }
}
