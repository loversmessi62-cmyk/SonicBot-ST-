import { sticker } from "../lib/sticker.js";

export default {
  commands: ["brat"],
  category: "sticker",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const usedPrefix = ".";
    const command = "brat";
    const botname = "ADRIBOT";
    const redes = "https://github.com/WillZek";
    const imagen1 = null;

    let text = args.join(" ").trim();
    if (!text) {
      return sock.sendMessage(
        jid,
        { text: `⚠️ Ingresa un texto para tu sticker\n> Ejemplo: ${usedPrefix + command} Hola` },
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
      let username = msg.pushName || "Usuario";
      const stiker = await sticker(
        null,
        `https://star-void-api.vercel.app/api/brat?text=${encodeURIComponent(text)}`,
        text,
        username
      );

      await sock.sendMessage(
        jid,
        { sticker: stiker },
        {
          quoted: msg,
          contextInfo: {
            forwardingScore: 200,
            isForwarded: false,
            externalAdReply: {
              showAdAttribution: false,
              title: text,
              body: username,
              mediaType: 2,
              sourceUrl: redes,
              thumbnail: imagen1
            }
          }
        }
      );
    } catch (e) {
      console.error("❌ BRAT ERROR:", e);
      await sock.sendMessage(
        jid,
        { text: `❌ Error al generar el sticker: ${e.message}` },
        { quoted: msg }
      );
    }
  }
};