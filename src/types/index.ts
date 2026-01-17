export type Song = {
  url: string;
  addedAt: Date;
  title: string;
  filePath?: string;
  telegramFileId?: string; // Cache the file on Telegram servers
};

export type Vibe = {
  id: string; // Unique ID for sharing
  name: string;
  songs: Song[];
};

export type UserData = {
  vibes: Record<string, Vibe>;
  pendingLink?: string; // Link waiting for vibe selection
  state?: "WAITING_FOR_VIBE_NAME"; // State for creating new vibes
};
