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

  // NEW BYPASS STRATEGY:
  // 1. Force the 'ios' client only (most stable bypass currently)
  // 2. Add 'impersonate' headers to look like a real Apple device
  const command = `${YTDLP_PATH} ${cookiesArg} \
    --force-ipv4 \
    --extractor-args "youtube:player_client=ios;player_skip=webpage,configs" \
    -x --audio-format mp3 --no-playlist --no-warnings \
    --write-thumbnail --convert-thumbnails jpg \
    --print "title" --print "after_move:filepath" \
    -o "${downloadsDir}/%(id)s.%(ext)s" "${url}"`;

  try {
    console.log("🚀 Attempting iOS Client Bypass for:", url);
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
    console.error("❌ YT-DLP ERROR:", error.message);
    throw new Error(
      "YouTube blocked the server. Try a different video or wait a few minutes.",
    );
  }
}
