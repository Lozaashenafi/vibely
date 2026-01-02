import { UserData } from "../types";

const users: Record<number, UserData> = {};

export function getUser(chatId: number): UserData {
  if (!users[chatId]) {
    users[chatId] = { vibes: {} };
  }
  return users[chatId];
}
