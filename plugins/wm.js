import pino from "pino";
import { Sticker } from "wa-sticker-formatter";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

const logger = pino({ level: "silent" });

async function getQuotedStickerBuffer(sock, msg) {
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  const quoted = ctx?.quotedMessage; // IMessage
  if (!quoted?.stickerMessage) return null;

  // Construimos un WAMessage mínimo usando la info del quoted
  const quotedWAMessage = {
    key: {
      remoteJid: msg.key.remoteJid,
      id: ctx.stanzaId,              // id del mensaje citado
      participant: ctx.participant,  // quién lo envió (en grupos)
      fromMe: false
    },
    message: quoted
  };

  // Descarga a Buffer directo
  const buffer = await downloadMediaMessage(
    quotedWAMessage,
    "buffer",
    {},
    {
      logger,
      reuploadRequest: sock.updateMediaMessage
    }
  );

  return buffer;
}

export default {
  commands: ["wm", "take", "robar"],
  category: "tools",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;

    let stickerBuffer;
    try {
      stickerBuffer = await getQuotedStickerBuffer(sock, msg);
    } catch (e) {
      console.error("❌ DOWNLOAD ERROR:", e);
      return sock.sendMessage(
        jid,
        { text: `❌ No pude descargar el sticker citado: ${e?.message || e}` },
        { quoted: msg }
      );
    }

    if (!stickerBuffer) {
      return sock.sendMessage(
        jid,
        { text: "⚠️ Responde a un sticker con el comando.\nEjemplo: wm Pack | Autor" },
        { quoted: msg }
      );
    }

    const text = args.join(" ").trim();
    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "⚠️ Escribe el nombre del Pack (y opcional el Autor)." },
        { quoted: msg }
      );
    }

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