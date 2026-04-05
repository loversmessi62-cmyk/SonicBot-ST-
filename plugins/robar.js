import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { writeExif } from "../lib/exif.js";

export default {
  commands: ["robar", "steal"],
  category: "stickers",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;

    // 📝 Nombre del pack
    const packname = args.join(" ").trim();
    if (!packname) {
      return sock.sendMessage(jid, {
        text: "❌ Usa: .robar NombreDelPack\n\nResponde a un sticker."
      }, { quoted: msg });
    }

    try {
      // 📩 Obtener mensaje citado correctamente
      let quotedMsg = msg.message?.extendedTextMessage?.contextInfo;

      if (!quotedMsg) {
        return sock.sendMessage(jid, {
          text: "❌ Debes responder a un sticker."
        }, { quoted: msg });
      }

      let quoted = quotedMsg.quotedMessage;

      // 🔥 Soporte para mensajes efímeros
      if (quoted?.ephemeralMessage) {
        quoted = quoted.ephemeralMessage.message;
      }

      if (!quoted?.stickerMessage) {
        return sock.sendMessage(jid, {
          text: "❌ El mensaje respondido no es un sticker."
        }, { quoted: msg });
      }

      // 📥 Descargar contenido
      const stream = await downloadContentFromMessage(
        quoted.stickerMessage,
        "sticker"
      );

      let buffer = Buffer.alloc(0);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer.length) {
        throw new Error("Buffer vacío");
      }

      // 🧬 Crear nuevo sticker con EXIF
      const sticker = await writeExif(buffer, {
        packname: packname,
        author: "SonicBot-MD"
      });

      // 📤 Enviar sticker final
      await sock.sendMessage(jid, {
        sticker: sticker
      }, { quoted: msg });

    } catch (error) {
      console.error("❌ ERROR .robar:", error);

      await sock.sendMessage(jid, {
        text: "❌ No se pudo robar el sticker."
      }, { quoted: msg });
    }
  }
};