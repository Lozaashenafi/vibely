import { UserModel } from "./db";
import { UserData, Vibe } from "../types";
import { v4 as uuidv4 } from "uuid";

export const sharedVibes: Record<
  string,
  { ownerId: number; vibeName: string }
> = {};

export async function syncRegistry() {
  const allUsers = await UserModel.find({});
  allUsers.forEach((u: any) => {
    u.vibes.forEach((vibe: Vibe, name: string) => {
      sharedVibes[vibe.id] = { ownerId: u.chatId, vibeName: name };
    });
  });
  console.log("🔄 Shared vibes registry synced");
}

export async function getUser(chatId: number): Promise<UserData> {
  let user = await UserModel.findOne({ chatId });

  if (!user) {
    const initialVibes: Record<string, Vibe> = {};
    const DEFAULT_VIBES = [
      "Jazz",
      "Reggae",
      "Afrobeats",
      "Chill",
      "Late Night",
      "Energy",
    ];

    DEFAULT_VIBES.forEach((name) => {
      const id = uuidv4();
      initialVibes[name] = { id, name, songs: [] };
      sharedVibes[id] = { ownerId: chatId, vibeName: name };
    });

    user = await UserModel.create({
      chatId,
      vibes: initialVibes,
    });
  }

  return user as unknown as UserData;
}

export async function saveUser(chatId: number, update: Partial<UserData>) {
  await UserModel.findOneAndUpdate({ chatId }, { $set: update });
}
