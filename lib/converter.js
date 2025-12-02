// lib/converter.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convertir imágenes y videos a webp
export function toWebp(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -i "${inputPath}" -vcodec libwebp -lossless 1 -preset picture -qscale 50 -vf scale=512:512:force_original_aspect_ratio=decrease "${outputPath}"`;

    exec(cmd, (err) => {
      if (err) reject(err);
      else resolve(outputPath);
    });
  });
}

// Guardar buffer temporalmente
export function saveTmp(buffer, ext = ".png") {
  return new Promise((resolve, reject) => {
    const file = path.join(__dirname, "../tmp/" + Date.now() + ext);
    fs.mkdirSync(path.dirname(file), { recursive: true });

    fs.writeFile(file, buffer, (err) => {
      if (err) reject(err);
      else resolve(file);
    });
  });
}
