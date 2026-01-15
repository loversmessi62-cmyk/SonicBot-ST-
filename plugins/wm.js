import fs from "fs";
import path from "path";
import {
  downloadContentFromMessage,
  writeExifSticker
} from "@whiskeysockets/baileys";

export default {
  commands: ["wm"],
  category: "sticker",
  description: "Cambia el watermark de un sticker",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;

    const quoted =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted?.stickerMessage) {
      return sock.sendMessage(
        jid,
        { text: "❌ Responde a un *sticker*\nEjemplo: .wm adri" },
        { quoted: msg }
      );
    }

    const text = args.join(" ").trim();
    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "❌ Escribe el watermark\nEjemplo: .wm adri" },
        { quoted: msg }
      );
    }

    const tmpDir = "./tmp";
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const input = path.join(tmpDir, `${Date.now()}.webp`);
    const output = path.join(tmpDir, `${Date.now()}_wm.webp`);

    // 📥 descargar sticker
    const stream = await downloadContentFromMessage(
      quoted.stickerMessage,
      "sticker"
    );

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    fs.writeFileSync(input, buffer);

    // ✍️ escribir EXIF (AQUÍ está la magia)
    const sticker = await writeExifSticker(
      { sticker: fs.readFileSync(input) },
      {
        packname: "",   // vacío
        author: text    // SOLO el texto
      }
    );

    fs.writeFileSync(output, sticker);

    await sock.sendMessage(
      jid,
      { sticker: fs.readFileSync(output) },
      { quoted: msg }
    );

    fs.unlinkSync(input);
    fs.unlinkSync(output);
  }
};
