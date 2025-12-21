import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
  commands: ["s", "sticker"],

  async run(sock, msg, args, ctx) {
    const jid = msg.key.remoteJid;

    let mediaMessage;

    // 1️⃣ MEDIA DIRECTA
    if (
      msg.message?.imageMessage ||
      msg.message?.videoMessage
    ) {
      mediaMessage =
        msg.message.imageMessage ||
        msg.message.videoMessage;
    }

    // 2️⃣ MEDIA RESPONDIDA (QUOTED)
    if (!mediaMessage) {
      const quoted =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (quoted?.imageMessage || quoted?.videoMessage) {
        mediaMessage =
          quoted.imageMessage ||
          quoted.videoMessage;
      }
    }

    // ❌ NADA
    if (!mediaMessage) {
      return sock.sendMessage(
        jid,
        { text: "❌ Responde a una imagen o video para hacer sticker." },
        { quoted: msg }
      );
    }

    // 3️⃣ DESCARGAR MEDIA REAL
    const stream = await downloadContentFromMessage(
      mediaMessage,
      mediaMessage.mimetype.split("/")[0]
    );

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // =====================
    // STICKER PRO
    // =====================
    const tmp = Date.now();
    const input = path.join(process.cwd(), `input_${tmp}`);
    const output = path.join(process.cwd(), `sticker_${tmp}.webp`);

    fs.writeFileSync(input, buffer);

    await new Promise((resolve, reject) => {
      const ff = spawn("ffmpeg", [
        "-y",
        "-i", input,
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

      ff.on("exit", code =>
        code === 0 ? resolve() : reject()
      );
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
