import Jimp from "jimp";
import { sticker } from "../lib/sticker.js";

export default {
  commands: ["brat"],
  category: "grupo",
  description: "Sticker BRAT local (fondo blanco, letras negras)",

  async run(sock, msg, args, ctx) {
    const jid = msg.key.remoteJid;
    let text = args.join(" ").trim();

    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "⚠️ Ejemplo:\n.brat HOLA" },
        { quoted: msg }
      );
    }

    if (text.length > 80) text = text.slice(0, 77) + "...";
    text = text.toUpperCase();

    try {
      // Crear imagen blanca 512x512
      const img = new Jimp(512, 512, "#FFFFFF");

      // Cargar fuente negra gruesa
      const font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);

      // Calcular wrap manual
      const maxWidth = 460;
      const marginTop = 100;

      img.print(
        font,
        26,
        marginTop,
        {
          text,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },
        maxWidth,
        320
      );

      const buffer = await img.getBufferAsync(Jimp.MIME_PNG);

      // Convertir a sticker WhatsApp
      const webp = await sticker(
        buffer,
        null,
        "ADRIBOT",
        "BRAT by Adri"
      );

      await sock.sendMessage(
        jid,
        { sticker: webp },
        { quoted: msg }
      );

    } catch (e) {
      console.error("❌ BRAT LOCAL ERROR:", e);
      await sock.sendMessage(
        jid,
        { text: "❌ Error generando sticker brat." },
        { quoted: msg }
      );
    }
  }
};
