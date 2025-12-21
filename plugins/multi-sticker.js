import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export default {
  commands: ["s", "sticker"],

  async run(sock, msg, args, ctx) {
    const jid = msg.key.remoteJid;

    let buffer;
    try {
      buffer = await ctx.download();
    } catch {
      return sock.sendMessage(
        jid,
        { text: "❌ Responde a una imagen o video para hacer sticker." },
        { quoted: msg }
      );
    }

    const tmp = Date.now();
    const input = path.join(process.cwd(), `input_${tmp}`);
    const output = path.join(process.cwd(), `sticker_${tmp}.webp`);

    fs.writeFileSync(input, buffer);

    await new Promise((resolve, reject) => {
      const ff = spawn("ffmpeg", [
        "-y",
        "-i", input,

        // 🔥 STICKER REAL WHATSAPP (512x512)
        "-vf",
        "scale=512:512:force_original_aspect_ratio=decrease," +
        "pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",

        "-vcodec", "libwebp",
        "-lossless", "0",
        "-q:v", "75",
        "-preset", "default",
        "-loop", "0",
        "-an",
        "-vsync", "0",
        "-pix_fmt", "yuv420p",
        output
      ]);

      ff.on("exit", code => {
        code === 0 ? resolve() : reject(new Error("FFmpeg error"));
      });
    });

    const stickerBuffer = fs.readFileSync(output);

    await sock.sendMessage(
      jid,
      { sticker: stickerBuffer },
      { quoted: msg }
    );

    fs.unlinkSync(input);
    fs.unlinkSync(output);
  }
};
