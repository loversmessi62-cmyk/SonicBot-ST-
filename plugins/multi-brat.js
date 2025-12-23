import Jimp from "jimp";
import { sticker } from "../lib/sticker.js";

export default {
  commands: ["brat"],
  category: "grupo",
  description: "Sticker BRAT (texto centrado sin cortar)",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    let text = args.join(" ").trim();

    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "⚠️ Ejemplo:\n.brat SOTO EXCLUSIVO" },
        { quoted: msg }
      );
    }

    text = text.toUpperCase();

    try {
      // Canvas blanco
      const img = new Jimp(512, 512, "#FFFFFF");

      // ÚNICA fuente segura en host
      const font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);

      // Área de impresión controlada (CLAVE)
      img.print(
        font,
        20,
        20,
        {
          text,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },
        472, // ancho controlado
        472  // alto controlado
      );

      const buffer = await img.getBufferAsync(Jimp.MIME_PNG);

      const webp = await sticker(
        buffer,
        null,
        "ADRIBOT",
        "BRAT"
      );

      await sock.sendMessage(
        jid,
        { sticker: webp },
        { quoted: msg }
      );

    } catch (e) {
      console.error("❌ BRAT ERROR:", e);
      await sock.sendMessage(
        jid,
        { text: "❌ Error generando sticker brat." },
        { quoted: msg }
      );
    }
  }
};