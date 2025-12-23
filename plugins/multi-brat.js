import Jimp from "jimp";
import { sticker } from "../lib/sticker.js";

export default {
  commands: ["brat"],
  category: "grupo",
  description: "Sticker estilo BRAT (centrado perfecto)",

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
      // Canvas
      const img = new Jimp(512, 512, "#FFFFFF");

      // Elegir fuente según largo
      let font;
      if (text.length <= 10) {
        font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
      } else if (text.length <= 20) {
        font = await Jimp.loadFont(Jimp.FONT_SANS_96_BLACK);
      } else {
        font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
      }

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

    } catch (e) {
      console.error("❌ ERROR BRAT:", e);
      await sock.sendMessage(
        jid,
        { text: "❌ Error creando el sticker." },
        { quoted: msg }
      );
    }
  }
};