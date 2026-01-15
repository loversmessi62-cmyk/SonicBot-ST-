import fs from "fs";
import path from "path";
import {
  downloadContentFromMessage,
  writeExifSticker
} from "@whiskeysockets/baileys";

export default {
  commands: ["wm"],
  category: "sticker",

  async run(sock, msg) {
    const jid = msg.key.remoteJid;

    const body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      "";

    const text = body.replace(/^\.wm\s*/i, "").trim();

    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "❌ Usa: *.wm texto*\nEjemplo: .wm adri" },
        { quoted: msg }
      );
    }

    const quoted =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted?.stickerMessage) {
      return sock.sendMessage(
        jid,
        { text: "❌ Responde a un *sticker*" },
        { quoted: msg }
      );
    }

    const tmp = "./tmp";
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);

    const input = path.join(tmp, `${Date.now()}.webp`);
    const output = path.join(tmp, `${Date.now()}_wm.webp`);

    // ⬇️ descargar sticker
    const stream = await downloadContentFromMessage(
      quoted.stickerMessage,
      "sticker"
    );

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    fs.writeFileSync(input, buffer);

    // ✍️ escribir watermark REAL
    const sticker = await writeExifSticker(
      { sticker: fs.readFileSync(input) },
      {
        packname: "",
        author: text
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
