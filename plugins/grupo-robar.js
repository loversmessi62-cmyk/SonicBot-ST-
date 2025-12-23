import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { sticker } from "../lib/sticker.js";

export default {
  commands: ["robar"],
  category: "grupo",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const packName = args.join(" ").trim();

    if (!packName) return;

    const quoted =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted || !quoted.stickerMessage) return;

    try {
      // 🔽 DESCARGAR STICKER CORRECTAMENTE
      const stream = await downloadContentFromMessage(
        quoted.stickerMessage,
        "sticker"
      );

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // 🔁 REEMPACAR STICKER (SOLO CAMBIA EL NOMBRE)
      const webp = await sticker(
        buffer,
        null,
        packName, // nombre nuevo
        ""        // autor vacío
      );

      await sock.sendMessage(jid, { sticker: webp });

    } catch (e) {
      console.error("❌ ERROR .robar:", e);
    }
  }
};