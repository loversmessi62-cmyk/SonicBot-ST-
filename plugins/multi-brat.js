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
        { text: "⚠️ Usa:\n.brat TEXTO (máx 30 letras)" },
        { quoted: msg }
      );
    }

    text = text.toUpperCase();

    if (text.length > 30) {
      return sock.sendMessage(
        jid,
        { text: "❌ Máximo 30 letras para el sticker brat." },
        { quoted: msg }
      );
    }

    try {
      // Tamaño dinámico según letras
      let scale = 1;

      if (text.length <= 8) scale = 1;
      else if (text.length <= 14) scale = 0.8;
      else if (text.length <= 20) scale = 0.65;
      else scale = 0.5;

      // Canvas grande base
      const base = new Jimp(512, 512, "#FFFFFF");
      const font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);

      base.print(
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

      // 🔥 ESCALADO INTELIGENTE (CLAVE)
      base.scale(scale);

      // Recentrar en canvas final
      const finalImg = new Jimp(512, 512, "#FFFFFF");
      finalImg.composite(
        base,
        (512 - base.bitmap.width) / 2,
        (512 - base.bitmap.height) / 2
      );

      const buffer = await finalImg.getBufferAsync(Jimp.MIME_PNG);

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