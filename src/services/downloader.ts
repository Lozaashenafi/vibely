import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const execPromise = promisify(exec);

const YTDLP_PATH = "yt-dlp";

export async function downloadAudio(
  url: string,
): Promise<{ filePath: string; title: string; thumbPath?: string }> {
  // Use a predictable path for downloads
  const downloadsDir = path.resolve("downloads");
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  const command = `${YTDLP_PATH} -x --audio-format mp3 --no-playlist --no-warnings --write-thumbnail --convert-thumbnails jpg --print "title" --print "after_move:filepath" -o "${downloadsDir}/%(id)s.%(ext)s" "${url}"`;

  try {
    console.log("🚀 Starting download process for:", url);

    // Increase timeout to 3 minutes for slower Render instances
    const { stdout, stderr } = await execPromise(command, { timeout: 180000 });

    if (stderr) {
      console.log("⚠️ YT-DLP Stderr (can be ignored if success):", stderr);
    }

    const lines = stdout
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "");
    const filePath = lines[lines.length - 1]?.trim();
    const title = lines[lines.length - 2]?.trim() || "Unknown Title";

    if (!filePath || !fs.existsSync(filePath)) {
      console.error("❌ File Verification Failed. Path:", filePath);
      throw new Error("Audio file was not created.");
    }

    // Look for the thumbnail (it has the same name but .jpg)
    const thumbPath = filePath.replace(".mp3", ".jpg");

    console.log("✅ Download successful:", title);
    return {
      filePath,
      title,
      thumbPath: fs.existsSync(thumbPath) ? thumbPath : undefined,
    };
  } catch (error: any) {
    console.error("❌ YT-DLP EXECUTION ERROR:", error.message);

    // Check if it's a known restricted video
    if (error.message.includes("Sign in to confirm")) {
      throw new Error("This video is age-restricted or requires login.");
    }

    throw new Error(`Download failed: ${error.message}`);
  }
}
