// plugins/brat.js
import axios from "axios";
import { sticker } from "../lib/sticker.js";

export default {
  commands: ["brat"],
  category: "grupo",
  description: "Sticker BRAT (fondo blanco, texto negro grueso)",

  async run(sock, msg, args, ctx) {
    const { jid } = ctx;

    let text = args.join(" ").trim();

    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "⚠️ Ejemplo:\n.brat HOLA" },
        { quoted: msg }
      );
    }

    // límite razonable
    if (text.length > 80) text = text.slice(0, 77) + "...";

    await sock.sendMessage(
      jid,
      { text: "🍑 Generando sticker brat..." },
      { quoted: msg }
    );

    try {
      // Ajuste automático de tamaño
      const len = text.length;
      let fontSize = 220;
      if (len > 6) fontSize = 160;
      if (len > 12) fontSize = 120;
      if (len > 20) fontSize = 95;
      if (len > 35) fontSize = 75;

      // Código canvas limpio (BRAT real)
      const code = `
c.width = 512
c.height = 512

// Fondo blanco puro
ctx.clearRect(0, 0, 512, 512)
ctx.fillStyle = "#FFFFFF"
ctx.fillRect(0, 0, 512, 512)

// Texto negro grueso
ctx.fillStyle = "#000000"
ctx.textAlign = "center"
ctx.textBaseline = "middle"
ctx.font = "900 ${fontSize}px Arial Black, Impact, Sans-serif"

// Función wrap
function wrap(text, maxWidth) {
  const words = text.split(" ")
  const lines = []
  let line = ""
  for (let w of words) {
    const test = line ? line + " " + w : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

const lines = wrap(${JSON.stringify(text.toUpperCase())}, 460)
const lineHeight = ${fontSize} * 0.9
const startY = 256 - ((lines.length - 1) * lineHeight) / 2

for (let i = 0; i < lines.length; i++) {
  ctx.fillText(lines[i], 256, startY + i * lineHeight)
}
`;

      const api = "https://nurutomo.herokuapp.com/api/canvas?type=png&quality=1";

      const res = await axios.post(api, code, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Length": Buffer.byteLength(code).toString()
        },
        responseType: "arraybuffer",
        timeout: 20000
      });

      const pngBuffer = Buffer.from(res.data);

      // Convertir a sticker WhatsApp real
      const webp = await sticker(
        pngBuffer,
        null,
        "ADRIBOT",
        "BRAT by Adri"
      );

      await sock.sendMessage(
        jid,
        { sticker: webp },
        { quoted: msg }
      );

    } catch (err) {
      console.error("❌ BRAT error:", err);

      // Fallback simple
      try {
        const url = `https://api.xzere.dev/api/brat?text=${encodeURIComponent(text)}`;
        await sock.sendMessage(
          jid,
          { sticker: { url } },
          { quoted: msg }
        );
      } catch {
        await sock.sendMessage(
          jid,
          { text: "❌ Error generando sticker brat." },
          { quoted: msg }
        );
      }
    }
  }
};
