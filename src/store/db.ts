import mongoose, { Schema } from "mongoose";

const SongSchema = new Schema({
  url: String,
  addedAt: { type: Date, default: Date.now },
  title: String,
  filePath: String,
  telegramFileId: String,
});

const VibeSchema = new Schema({
  id: String,
  name: String,
  songs: [SongSchema],
});

const UserSchema = new Schema({
  chatId: { type: Number, required: true, unique: true },
  vibes: { type: Map, of: VibeSchema },
  state: String,
  pendingLink: String,
});

export const UserModel = mongoose.model("User", UserSchema);

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("📦 Connected to MongoDB Atlas");
}
