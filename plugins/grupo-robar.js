import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { writeExif } from "../lib/exif.js"; // 👈 ESTO ES CLAVE

export default {
  commands: ["robar"],
  category: "grupo",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const packName = args.join(" ").trim();

    if (!packName) return;

    const quoted =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted?.stickerMessage) return;

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

      // 🧬 REESCRIBIR EXIF (RENOMBRAR)
      const renamedSticker = await writeExif(
        buffer,
        {
          packname: packName,
          author: ""
        }
      );

      await sock.sendMessage(jid, { sticker: renamedSticker });

    } catch (e) {
      console.error("❌ ERROR .robar:", e);
    }
  }
};