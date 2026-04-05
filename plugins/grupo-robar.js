import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { writeExif } from "../lib/exif.js";

export default {
  commands: ["robar"],
  category: "grupo",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const packname = args.join(" ").trim();

    if (!packname) {
      return sock.sendMessage(jid, {
        text: "❌ Usa: .robar NombreDelPack\n\nResponde a un sticker."
      }, { quoted: msg });
    }

    // 📩 Obtener mensaje citado (soporta ephemeral)
    let quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {
      return sock.sendMessage(jid, {
        text: "❌ Debes responder a un sticker."
      }, { quoted: msg });
    }

    // 🔥 Soporte para mensajes temporales
    if (quoted.ephemeralMessage) {
      quoted = quoted.ephemeralMessage.message;
    }

    const sticker = quoted.stickerMessage;

    if (!sticker) {
      return sock.sendMessage(jid, {
        text: "❌ Eso no es un sticker."
      }, { quoted: msg });
    }

    try {
      // 📥 Descargar sticker correctamente
      const stream = await downloadContentFromMessage(sticker, "sticker");

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // 🧬 Reescribir EXIF
      const renamed = await writeExif(buffer, {
        packname,
        author: "SonicBot-MD"
      });

      // 📤 Enviar sticker robado
      await sock.sendMessage(jid, {
        sticker: renamed
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ ERROR .robar:", err);

      sock.sendMessage(jid, {
        text: "❌ Error al procesar el sticker."
      }, { quoted: msg });
    }
  }
};