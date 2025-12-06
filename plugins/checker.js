export default {
  commands: ["checker", "check", "chacker"],
  category: "tools",

  async run(sock, msg, args, ctx) {
    try {
      // Detectar TXT (quoted o enviado con el comando)
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const selfDoc = msg.message?.documentMessage;
      const doc = quoted?.documentMessage || selfDoc;

      if (!doc) {
        return sock.sendMessage(ctx.jid, {
          text: "📄 *Responde a un archivo TXT o envíalo junto al comando.*"
        });
      }

      // Descargar archivo
      const buffer = await ctx.download();
      const text = buffer.toString("utf8");

      // Leer líneas *exactas* como vienen en el TXT
      const lines = text
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

      // Config
      const LAST_N = 8;
      const MIN_REPEATS = 6; // mínimo 6 repeticiones
      const TOP_N = 10;

      function countMaxRepeats(segment) {
        const map = {};
        for (const ch of segment) {
          if (!/[0-9]/.test(ch)) continue;
          map[ch] = (map[ch] || 0) + 1;
        }
        return Math.max(0, ...Object.values(map));
      }

      const results = [];

      for (const line of lines) {
        // sacar SOLO dígitos, pero **la línea original se respeta**
        const digits = line.replace(/\D/g, "");

        if (digits.length < LAST_N) continue;

        const segment = digits.slice(-LAST_N);
        const repeats = countMaxRepeats(segment);

        if (repeats >= MIN_REPEATS) {
          results.push({
            original: line,     // <- exactamente como viene en el TXT
            segment,
            repeats
          });
        }
      }

      if (results.length === 0) {
        return sock.sendMessage(ctx.jid, {
          text: `❌ No hay números con mínimo ${MIN_REPEATS} repeticiones en las últimas ${LAST_N} cifras.`
        });
      }

      // ordenar
      results.sort((a, b) => b.repeats - a.repeats);
      const top = results.slice(0, TOP_N);

      // construir respuesta
      let msgOut = `📊 *TOP ${top.length} — NÚMEROS CON MÁS REPETIDOS*\n`;
      msgOut += `📌 (analizando últimas ${LAST_N} cifras, mínimo ${MIN_REPEATS} repeticiones)\n\n`;

      for (const r of top) {
        msgOut += `🔹 ${r.original}\n`;
        msgOut += `   ➤ Segmento: ${r.segment} → repetidos: *${r.repeats}*\n\n`;
      }

      await sock.sendMessage(ctx.jid, { text: msgOut });

    } catch (err) {
      console.error("CHECKER ERROR:", err);
      return sock.sendMessage(ctx.jid, {
        text: "❌ Ocurrió un error procesando el archivo TXT."
      });
    }
  }
};
