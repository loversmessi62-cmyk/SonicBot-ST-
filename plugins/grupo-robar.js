import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { writeExif } from "../lib/exif.js";

export default {
  commands: ["robar"],
  category: "grupo",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const packname = args.join(" ").trim();

    // ❌ Sin nombre
    if (!packname) {
      return sock.sendMessage(jid, {
        text: "❌ Escribe el nombre del pack.\n\nEjemplo: .robar Mi Pack"
      }, { quoted: msg });
    }

    // 📩 Obtener mensaje citado
    const quoted =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {
      return sock.sendMessage(jid, {
        text: "❌ Responde a un sticker."
      }, { quoted: msg });
    }

    if (!quoted.stickerMessage) {
      return sock.sendMessage(jid, {
        text: "❌ Solo puedes robar stickers."
      }, { quoted: msg });
    }

    try {
      // 📥 Descargar sticker
      const stream = await downloadContentFromMessage(
        quoted.stickerMessage,
        "sticker"
      );

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // 🧬 Reescribir EXIF
      const renamed = await writeExif(buffer, {
        packname,
        author: "SonicBot-MD" // puedes cambiar esto
      });

      // 📤 Enviar sticker
      await sock.sendMessage(jid, {
        sticker: renamed
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ ERROR .robar:", e);

      sock.sendMessage(jid, {
        text: "❌ Ocurrió un error al robar el sticker."
      }, { quoted: msg });
    }
  }
};