import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const execPromise = promisify(exec);
const YTDLP_PATH =
  "C:\\Users\\loza\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\yt-dlp.exe";

export async function downloadAudio(
  url: string
): Promise<{ filePath: string; title: string }> {
  const downloadsDir = path.resolve("downloads");
  if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

  // We ask yt-dlp to print the Title AND the Filepath separated by a pipe |
  const command = `"${YTDLP_PATH}" -x --audio-format mp3 --no-playlist --format "bestaudio/best" --print "title" --print "after_move:filepath" -o "${downloadsDir}/%(id)s.%(ext)s" "${url}"`;

  try {
    console.log("🚀 Downloading:", url);
    const { stdout } = await execPromise(command, { timeout: 120000 });

    // Split the output into Title and Path
    const output = stdout.trim().split("\n");
    const title = output[0];
    const filePath = output[1];

    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error("File not found.");
    }

    return { filePath, title };
  } catch (error: any) {
    console.error("Download Error:", error.message);
    throw new Error(
      "I can't access this link. It might be private or restricted."
    );
  }
}
