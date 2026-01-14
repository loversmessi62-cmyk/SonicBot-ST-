import { sticker } from "../lib/sticker.js";
import axios from "axios";

export default {
  commands: ["brat"],
  category: "sticker",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    let text = args.join(" ").trim();

    if (!text) return sock.sendMessage(jid, { text: "⚠️ Ingresa un texto" }, { quoted: msg });
    if (text.length > 20) return sock.sendMessage(jid, { text: "❌ Máximo 20 letras." }, { quoted: msg });

    try {
      const url = `https://ryuseiclub.xyz/ai/brat?text=${encodeURIComponent(text)}&apikey=100`;
      const res = await axios.post(url, {}, { responseType: "arraybuffer" });
      const buffer = Buffer.from(res.data);

      const webp = await sticker(buffer);

      await sock.sendMessage(jid, { sticker: webp }, { quoted: msg });
    } catch (e) {
      console.error("❌ BRAT ERROR:", e);
      await sock.sendMessage(jid, { text: `❌ Error al generar el sticker: ${e.message}` }, { quoted: msg });
    }
  }
};