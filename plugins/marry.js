import { bodas } from "./marry.js"; // ajusta ruta

export async function detectarRespuesta(sock, msg) {
  const jid = msg.key.remoteJid;

  // 🔥 Detectar texto correctamente
  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    "";

  if (!text) return;

  const body = text.trim();

  for (let id in bodas) {
    const boda = bodas[id];

    if (!boda.activo || boda.jid !== jid) continue;

    const { p1, p2 } = boda;

    // 🔥 Obtener quien envía correctamente
    const sender = msg.key.participant || msg.key.remoteJid;

    // ✅ Solo ellos pueden responder
    if (![p1, p2].includes(sender)) continue;

    const toM = (a) => '@' + a.split('@')[0];

    // ❌ Rechazar
    if (body === "1") {
      boda.activo = false;

      await sock.sendMessage(jid, {
        text: `💔 *BODA CANCELADA*\n\n😢 ${toM(p1)} y ${toM(p2)} no se casaron.`,
        mentions: [p1, p2]
      });

      delete bodas[id];
      return;
    }

    // 💍 Aceptar
    if (body === "2") {
      boda.activo = false;

      await sock.sendMessage(jid, {
        text: `💍 *BODA CONFIRMADA*\n\n👰 ${toM(p1)}\n🤵 ${toM(p2)}\n\n💖 ¡Felicidades! 🎉`,
        mentions: [p1, p2]
      });

      delete bodas[id];
      return;
    }
  }
}