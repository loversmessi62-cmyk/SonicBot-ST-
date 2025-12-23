import { sticker } from "../lib/sticker.js";

export default {
  commands: ["robar"],
  category: "grupo",

  async run(sock, msg, args, ctx) {
    const jid = msg.key.remoteJid;
    const packName = args.join(" ").trim();

    // Debe tener nombre
    if (!packName) return;

    const quoted =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    // Debe responder a un sticker
    if (!quoted?.stickerMessage) return;

    try {
      // Descargar sticker (memoria, host-safe)
      const buffer = await ctx.download(quoted.stickerMessage);

      // Reempaquetar sticker con nuevo nombre
      const webp = await sticker(
        buffer,
        null,
        packName, // SOLO esto cambia
        ""        // autor vacío
      );

      await sock.sendMessage(jid, { sticker: webp });

    } catch (e) {
      console.error("❌ ROBAR ERROR:", e);
    }
  }
};