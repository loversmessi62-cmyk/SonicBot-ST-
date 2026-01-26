import { Sticker, StickerTypes } from "wa-sticker-formatter";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";

export default {
  commands: ["wm", "take", "robar"],
  tags: ["tools"],
  desc: "Cambiar watermark de stickers",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    let mediaMessage;

    if (msg.message?.stickerMessage) {
      mediaMessage = msg.message.stickerMessage;
    }

    if (!mediaMessage) {
      const quoted =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (quoted?.stickerMessage) {
        mediaMessage = quoted.stickerMessage;
      }
    }

    if (!mediaMessage) {
      return sock.sendMessage(
        jid,
        { text: "⚠️ Responde a un sticker." },
        { quoted: msg }
      );
    }

    const text = args.join(" ").trim();
    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "⚠️ Usa: .wm Pack | Autor" },
        { quoted: msg }
      );
    }

    const [pack = "Sticker Pack", author = "WM"] =
      (text.split(/[|•]/).map(v => v.trim())).concat(["Sticker Pack", "WM"]);

    try {
      const stream = await downloadContentFromMessage(
        mediaMessage,
        mediaMessage.mimetype.split("/")[0]
      );

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const sticker = new Sticker(buffer, {
        pack,
        author,
        type: StickerTypes.FULL,
        quality: 80,
      });

      await sock.sendMessage(
        jid,
        { sticker: await sticker.toBuffer() },
        { quoted: msg }
      );
    } catch (e) {
      console.error(e);
      await sock.sendMessage(
        jid,
        { text: "❌ Error al modificar el sticker." },
        { quoted: msg }
      );
    }
  }
};