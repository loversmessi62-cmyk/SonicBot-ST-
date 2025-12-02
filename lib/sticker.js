import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { spawn } from "child_process";

// Convertir buffer a WebP usando ffmpeg sin dependencias externas
function convertToWebp(inputBuffer) {
  return new Promise(async (resolve, reject) => {
    const input = join(tmpdir(), "input_" + Date.now() + ".png");
    const output = join(tmpdir(), "output_" + Date.now() + ".webp");

    try {
      await writeFile(input, inputBuffer);

      const ff = spawn("ffmpeg", [
        "-y",
        "-i", input,
        "-vcodec", "libwebp",
        "-lossless", "1",
        "-preset", "picture",
        "-qscale", "60",
        "-o", output
      ]);

      ff.on("exit", async () => {
        try {
          const webp = await import("fs").then(fs => fs.readFileSync(output));
          await unlink(input).catch(_ => {});
          await unlink(output).catch(_ => {});
          resolve(webp);
        } catch (err) {
          reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

// Crear EXIF minimal
function createExif(packname = "Sticker", author = "BOT") {
  const exifAttr = {
    "sticker-pack-id": "AdriBot",
    "sticker-pack-name": packname,
    "sticker-pack-publisher": author,
    "android-app-store-link": "",
    "ios-app-store-link": ""
  };

  let json = Buffer.from(JSON.stringify(exifAttr));
  let exif = Buffer.concat([
    Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00]),
    json
  ]);

  return exif;
}

// Pegar EXIF al sticker WebP
async function addExif(webpBuffer, packname, author) {
  const exif = createExif(packname, author);

  return Buffer.concat([exif, webpBuffer]);
}

export async function sticker(buffer, options = null, packname = "Pack", author = "Bot") {
  try {
    const webp = await convertToWebp(buffer);
    const final = await addExif(webp, packname, author);
    return final;
  } catch (err) {
    console.error("Sticker error:", err);
    return null;
  }
}
