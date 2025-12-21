// plugins/brat.js
import axios from "axios";
import { sticker } from "../lib/sticker.js";

export default {
  commands: ["brat"],
  category: "grupo",
  description: "Genera un sticker 'brat' (fondo blanco, letras grandes).",

  async run(sock, msg, args, ctx) {
    const { jid } = ctx;
    let text = args.join(" ").trim();

    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "⚠️ Escribe algo para generar el sticker brat.\nEjemplo:\n.brat prueba" },
        { quoted: msg }
      );
    }

    // Limitar por seguridad (puedes ajustar)
    if (text.length > 80) text = text.slice(0, 77) + "...";

    await sock.sendMessage(jid, { text: "🍑 Generando tu sticker brat..." }, { quoted: msg });

    try {
      // Construir código para el servicio nurutomo (devuelve PNG)
      // Ajusta tamaño y tipografía según longitud
      const len = text.length;
      let fontSize = 220;
      if (len > 6) fontSize = 160;
      if (len > 12) fontSize = 120;
      if (len > 20) fontSize = 90;
      if (len > 40) fontSize = 70;

      // Código JS que se ejecuta en el servicio canvas (nurutomo)
      const code = `
c.width = 512
c.height = 512
// fondo blanco
ctx.fillStyle = "#ffffff"
ctx.fillRect(0,0,512,512)
// texto negro, centrado, con ajuste de tamaño
ctx.fillStyle = "#000000"
ctx.textAlign = "center"
ctx.textBaseline = "middle"
ctx.font = "bold ${fontSize}px Sans-serif"

// dividir en líneas si es necesario
function wrapText(text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (let n = 0; n < words.length; n++) {
    const testLine = line + (line ? ' ' : '') + words[n]
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && line) {
      lines.push(line)
      line = words[n]
    } else {
      line = testLine
    }
  }
  if (line) lines.push(line)
  return lines
}

const lines = wrapText(${JSON.stringify(text)}, 440)
const startY = 256 - ((lines.length - 1) * (${fontSize} * 0.6)) / 2
for (let i = 0; i < lines.length; i++) {
  ctx.fillText(lines[i], 256, startY + i * (${fontSize} * 0.6))
}

// marca pequeña abajo
ctx.font = "bold 18px Sans-serif"
ctx.fillStyle = "rgba(0,0,0,0.45)"
ctx.textAlign = "right"
ctx.fillText("Hecho por ADRIBOT", 500, 498)
`;

      const api = "https://nurutomo.herokuapp.com/api/canvas?type=png&quality=0.92";

      const res = await axios.post(api, code, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Length": Buffer.byteLength(code).toString()
        },
        responseType: "arraybuffer",
        timeout: 20000
      });

      const pngBuffer = Buffer.from(res.data);

      // Convertir a sticker usando tu lib/sticker.js
      // pack + author (exif) — puedes cambiar nombres
      const webp = await sticker(pngBuffer, null, "ADRIBOT", "Hecho por Adri");

      if (!webp) {
        throw new Error("No se generó el sticker final.");
      }

      await sock.sendMessage(
        jid,
        { sticker: webp },
        { quoted: msg }
      );

    } catch (err) {
      console.error("Error BRAT:", err);

      // Fallback: intentar con la API externa simple (si nurutomo falla)
      try {
        const quickUrl = `https://api.xzere.dev/api/brat?text=${encodeURIComponent(text)}`;
        // enviar como sticker vía URL (baileys puede aceptar url directas)
        await sock.sendMessage(jid, { sticker: { url: quickUrl } }, { quoted: msg });
      } catch (fallbackErr) {
        console.error("Fallback BRAT failed:", fallbackErr);
        await sock.sendMessage(jid, { text: "❌ Error generando el sticker brat." }, { quoted: msg });
      }
    }
  }
};
