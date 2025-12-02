import { dirname } from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { ffmpeg } from "./converter.js";
import { spawn } from "child_process";
import uploadFile from "./uploadFile.js";
import uploadImage from "./uploadImage.js";
import { fileTypeFromBuffer } from "file-type";
import webp from "node-webpmux";
import fetch from "node-fetch";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, "../tmp");

global.support = {
  ffmpeg: true,
  ffprobe: true,
  ffmpegWebp: true,
  convert: false,
  magick: false,
  gm: false,
  find: false
};

// =============== HELPERS ===============
async function canvas(code, type = "png") {
  const url =
    "https://nurutomo.herokuapp.com/api/canvas?type=" + type + "&quality=0.92";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: code
  });

  if (!res.ok) throw new Error("Canvas API error");
  return res.buffer();
}

// =============== sticker (ffmpeg resize -> webp) ===============
async function sticker4(img, url) {
  if (url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error("Image download failed");
    img = await r.buffer();
  }

  return ffmpeg(
    img,
    [
      "-vf",
      "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000"
    ],
    "jpeg",
    "webp"
  );
}

// =============== EXIF ===============
async function addExif(webpSticker, packname, author, emojis = [""]) {
  const img = new webp.Image();
  const stickerPackId = crypto.randomBytes(32).toString("hex");

  const json = {
    "sticker-pack-id": stickerPackId,
    "sticker-pack-name": packname,
    "sticker-pack-publisher": author,
    "android-app-store-link":
      "https://play.google.com/store/apps/details?id=com.marsvard.stickermakerforwhatsapp",
    "ios-app-store-link":
      "https://itunes.apple.com/app/sticker-maker-studio/id1443326857",
    emojis
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
  ]);

  const jsonBuffer = Buffer.from(JSON.stringify(json), "utf-8");
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);

  await img.load(webpSticker);
  img.exif = exif;

  return img.save(null);
}

// =============== ORQUESTADOR ===============
async function sticker(img, url, packname = "Pack", author = "Bot") {
  // 1 — convertir a webp
  const buffer = await sticker4(img, url);

  // 2 — agregar exif
  try {
    return await addExif(buffer.data ? buffer.data : buffer, packname, author);
  } catch (e) {
    console.log("EXIF failed, sending raw sticker:", e);
    return buffer.data ? buffer.data : buffer;
  }
}

export { sticker };
