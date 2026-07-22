"use server";

import fs from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "hiking-photos");

export async function uploadHikingPhoto(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("未选择文件");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("仅支持 JPG、PNG、WebP、GIF 格式图片");
  }

  if (file.size > MAX_SIZE) {
    throw new Error("图片大小不能超过 5MB");
  }

  const ext = file.type.split("/")[1] || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  return { url: `/hiking-photos/${filename}` };
}
