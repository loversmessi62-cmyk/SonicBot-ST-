import fs from "fs";
import path from "path";
import { spawn } from "child_process";

export async function writeExifImg(
  buffer,
  { packname = "ADRIBOT", author = "Adri" } = {}
) {
  const tmp = Date.now();

  const input = path.join(process.cwd(), `qc_${tmp}.png`);
  const output = path.join(process.cwd(), `qc_${tmp}.webp`);

  fs.writeFileSync(input, buffer);

  // 🔥 STICKER REAL WHATSAPP (SIN FONDO BLANCO)
  await run("ffmpeg", [
    "-y",
    "-i", input,
    "-vf",
    "format=rgba," +
    "scale=512:512:force_original_aspect_ratio=decrease," +
    "pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
    "-vcodec", "libwebp",
    "-lossless", "0",
    "-q:v", "90",
    "-preset", "default",
    "-pix_fmt", "yuva420p", // 👈 ESTO ES LA CLAVE
    "-an",
    "-vsync", "0",
    output
  ]);

  fs.unlinkSync(input);

  return output;
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args);
    p.on("close", code =>
      code === 0 ? resolve() : reject(new Error("FFmpeg error"))
    );
  });
}
