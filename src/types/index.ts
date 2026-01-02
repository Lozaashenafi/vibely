export type Song = {
  url: string;
  addedAt: Date;
  title: string;
  filePath?: string;
};

export type UserData = {
  vibes: Record<string, Song[]>;
  pendingVibe?: string;
};
