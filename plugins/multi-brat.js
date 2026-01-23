import { Sticker } from "wa-sticker-formatter";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function getQuotedStickerBuffer(msg) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted) return null;

  const stickerMsg = quoted.stickerMessage;
  if (!stickerMsg) return null;

  const stream = await downloadContentFromMessage(stickerMsg, "sticker");
  return await streamToBuffer(stream);
}

export default {
  commands: ["wm", "take", "robar"],
  category: "tools",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const stickerBuffer = await getQuotedStickerBuffer(msg);

    if (!stickerBuffer)
      return sock.sendMessage(
        jid,
        { text: "⚠️ Responde a un sticker con el comando.\nEjemplo: wm Pack | Autor" },
        { quoted: msg }
      );

    const text = args.join(" ").trim();

    if (!text)
      return sock.sendMessage(
        jid,
        { text: "⚠️ Escribe el nombre del Pack (y opcional el Autor)." },
        { quoted: msg }
      );

    const parts = text.split(/[|•]/).map(x => x.trim()).filter(Boolean);
    const pack = parts[0] || "Sticker Pack";
    const author = parts[1] || "WM";

    if (pack.length > 50)
      return sock.sendMessage(jid, { text: "❌ Pack máximo 50 letras." }, { quoted: msg });

    if (author.length > 50)
      return sock.sendMessage(jid, { text: "❌ Autor máximo 50 letras." }, { quoted: msg });

    try {
      const sticker = new Sticker(stickerBuffer, {
        pack,
        author,
        type: "full",
        quality: 80
      });

      const webp = await sticker.toBuffer();
      await sock.sendMessage(jid, { sticker: webp }, { quoted: msg });
    } catch (e) {
      console.error("❌ WM ERROR:", e);
      await sock.sendMessage(
        jid,
        { text: `❌ Error al poner WM: ${e.message}` },
        { quoted: msg }
      );
    }
  }
};