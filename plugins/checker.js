export default {
  commands: ["checker", "check", "chacker"],
  category: "tools",

  async run(sock, msg, args, ctx) {
    try {
      // Detectar TXT
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const selfDoc = msg.message?.documentMessage;
      const doc = quoted?.documentMessage || selfDoc;

      if (!doc || !doc.mimetype.includes("text"))
        return sock.sendMessage(ctx.jid, { text: "📄 *Responde o envía un archivo TXT.*" });

      // Descargar archivo
      const buffer = await ctx.download();
      const text = buffer.toString("utf8");

      // CONFIG
      const LAST_N = 8;        // últimas 8 cifras
      const MIN_REPEATS = 6;   // mínimo 6 dígitos repetidos
      const TOP_N = 10;

      // convertir archivo en líneas tal cual vienen
      const lines = text
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

      const results = [];

      // Función para contar cuántas veces se repite el dígito más repetido
      function countRepeats(str) {
        const map = {};
        for (let c of str) {
          map[c] = (map[c] || 0) + 1;
        }
        return Math.max(...Object.values(map));
      }

      for (let line of lines) {

        // Sacar SOLO los dígitos de esa línea
        const digits = line.replace(/\D/g, "");

        // Debe tener al menos 8 cifras para evaluar
        if (digits.length < LAST_N) continue;

        // Segmento final real
        const segment = digits.slice(-LAST_N);

        // Contar repetidos dentro del segmento
        const repeats = countRepeats(segment);

        if (repeats >= MIN_REPEATS) {
          results.push({
            original: line,  // EXACTAMENTE como viene en el TXT
            segment,
            repeats
          });
        }
      }

      if (results.length === 0) {
        return sock.sendMessage(ctx.jid, {
          text: `❌ No hay números con mínimo ${MIN_REPEATS} dígitos repetidos.`
        });
      }

      // Ordenar del que más repite al que menos
      results.sort((a, b) => b.repeats - a.repeats);

      // Tomar los primeros 10
      const top = results.slice(0, TOP_N);

      // Formar salida
      let msgOut = `📊 *TOP ${top.length} — NÚMEROS CON MÁS REPETIDOS*\n\n`;

      for (let r of top) {
        msgOut += `🔹 ${r.original}\n`;
        msgOut += `   ➤ Últimas 8: ${r.segment} → repetidos: *${r.repeats}*\n\n`;
      }

      await sock.sendMessage(ctx.jid, { text: msgOut });

    } catch (e) {
      console.error("CHECKER ERROR:", e);
      await sock.sendMessage(ctx.jid, { text: "❌ Error procesando el TXT." });
    }
  }
};
