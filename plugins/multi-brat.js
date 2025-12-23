import Jimp from "jimp";
import { sticker } from "../lib/sticker.js";

export default {
  commands: ["brat"],
  category: "grupo",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    let text = args.join(" ").trim();

    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "⚠️ Usa:\n.brat TEXTO (máx 20 letras)" },
        { quoted: msg }
      );
    }

    text = text.toUpperCase();

    if (text.length > 20) {
      return sock.sendMessage(
        jid,
        { text: "❌ Máximo 20 letras." },
        { quoted: msg }
      );
    }

    try {
      // Selección de fuente segura
      let font;

      if (text.length <= 6) {
        font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
      } else if (text.length <= 12) {
        font = await Jimp.loadFont(Jimp.FONT_SANS_48_BLACK);
      } else {
        font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
      }

      // Canvas fijo
      const img = new Jimp(512, 512, "#FFFFFF");

      // Print seguro (sin recorte)
      img.print(
        font,
        0,
        0,
        {
          text,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },
        512,
        512
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

    } catch (err) {
      console.error("❌ BRAT ERROR:", err);
      await sock.sendMessage(
        jid,
        { text: "❌ Error al generar el sticker." },
        { quoted: msg }
      );
    }
  }
};