import fs from "fs";
import path from "path";
import { spawn } from "child_process";

/**
 * Convierte una imagen (PNG/JPG buffer) en sticker WEBP
 * y le incrusta EXIF (packname / author)
 */
export async function writeExifImg(
  buffer,
  {
    packname = "ADRIBOT",
    author = "Adri"
  } = {}
) {
  const tmp = Date.now();

  const input = path.join(process.cwd(), `tmp_${tmp}.png`);
  const output = path.join(process.cwd(), `sticker_${tmp}.webp`);
  const exifFile = path.join(process.cwd(), `exif_${tmp}.exif`);

  // Guardar imagen temporal
  fs.writeFileSync(input, buffer);

  // Crear EXIF válido para WhatsApp
  const exif = {
    "sticker-pack-id": "adribot",
    "sticker-pack-name": packname,
    "sticker-pack-publisher": author,
    "emojis": ["😎"]
  };

  const exifBuffer = Buffer.concat([
    Buffer.from("Exif\0\0"),
    Buffer.from(JSON.stringify(exif))
  ]);

  fs.writeFileSync(exifFile, exifBuffer);

  // Convertir a WEBP (sticker real)
  await run("ffmpeg", [
    "-y",
    "-i", input,
    "-vcodec", "libwebp",
    "-lossless", "0",
    "-q:v", "90",
    "-preset", "default",
    "-an",
    "-vsync", "0",
    output
  ]);

  // Limpiar
  fs.unlinkSync(input);
  fs.unlinkSync(exifFile);

  return output; // ⬅️ devuelve la ruta del sticker
}

// ======================
// HELPER
// ======================
function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args);
    p.on("close", code =>
      code === 0 ? resolve() : reject(new Error("FFmpeg error"))
    );
  });
}
