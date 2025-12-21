import axios from "axios";
import { writeExifImg } from "../lib/fuctions.js"; // ajusta si tu ruta cambia
import { uploadImage } from "../lib/uploadImage.js";

const colors = {
  rojo: "#FF0000",
  azul: "#0000FF",
  morado: "#800080",
  verde: "#008000",
  amarillo: "#FFFF00",
  naranja: "#FFA500",
  celeste: "#00FFFF",
  rosado: "#FFC0CB",
  negro: "#000000"
};

export default {
  commands: ["qc"],
  category: "grupo",

  async run(sock, msg, args, ctx) {
    const jid = msg.key.remoteJid;

    // ── TEXTO ─────────────────────────
    const quoted =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    let text =
      quoted?.conversation ||
      quoted?.extendedTextMessage?.text ||
      (args.length ? args.join(" ") : "");

    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "✏️ Usa:\n*.qc texto*\n*.qc rojo texto*\nO responde a un mensaje" },
        { quoted: msg }
      );
    }

    // ── COLOR ─────────────────────────
    const first = args[0]?.toLowerCase();
    const bgColor = colors[first] || colors.negro;

    if (colors[first]) {
      text = args.slice(1).join(" ") || text;
    }

    // ── NOMBRE ────────────────────────
    const name =
      msg.pushName ||
      ctx.sender.split("@")[0];

    // ── AVATAR (OPCIONAL) ──────────────
   let avatar = null;

try {
  const ppUrl = await sock.profilePictureUrl(ctx.sender, "image");

  const res = await axios.get(ppUrl, { responseType: "arraybuffer" });
  const buffer = Buffer.from(res.data);

  // subir a hosting público
  avatar = await uploadImage(buffer);
} catch {
  avatar = null;
}


    // ── PAYLOAD QC REAL ────────────────
    const quoteData = {
      type: "quote",
      format: "png",
      backgroundColor: bgColor,
      width: 600,
      height: 900,
      scale: 3,
      messages: [
        {
          avatar: !!avatar,
          from: {
            id: 1,
            name,
            photo: avatar ? { url: avatar } : undefined
          },
          text,
          replyMessage: {}
        }
      ]
    };

    try {
      await sock.sendMessage(jid, {
        react: { text: "🎨", key: msg.key }
      });

      const { data } = await axios.post(
        "https://bot.lyo.su/quote/generate",
        quoteData,
        { headers: { "Content-Type": "application/json" } }
      );

      const buffer = Buffer.from(
        data.result.image,
        "base64"
      );

      const sticker = await writeExifImg(buffer, {
        packname: "ADRIBOT",
        author: "Adri"
      });

      await sock.sendMessage(
        jid,
        { sticker: { url: sticker } },
        { quoted: msg }
      );

      await sock.sendMessage(jid, {
        react: { text: "✅", key: msg.key }
      });

    } catch (e) {
      console.error("❌ Error QC:", e);
      await sock.sendMessage(
        jid,
        { text: "❌ Error al generar el QC." },
        { quoted: msg }
      );
    }
  }
};
