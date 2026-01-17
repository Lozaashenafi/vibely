// src/services/downloader.ts
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

  // Path to the cookies file you just added
  const cookiesPath = path.resolve("cookies.txt");

  // Use cookies if the file exists
  const cookiesArg = fs.existsSync(cookiesPath)
    ? `--cookies "${cookiesPath}"`
    : "";

  // Improved command with cookies and safer extraction
  const command = `${YTDLP_PATH} ${cookiesArg} -x --audio-format mp3 --no-playlist --no-warnings --write-thumbnail --convert-thumbnails jpg --print "title" --print "after_move:filepath" -o "${downloadsDir}/%(id)s.%(ext)s" "${url}"`;

  try {
    console.log("🚀 Downloading with cookies...");
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
    console.error("❌ YT-DLP Error:", error.message);
    throw new Error(
      "YouTube is blocking this request. Please try again later or update cookies.",
    );
  }
}
