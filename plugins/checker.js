export default {
  commands: ["checker", "check", "chacker"],
  category: "tools",

  async run(sock, msg, args, ctx) {
    try {
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

      // Líneas tal cual vienen en el TXT
      const lines = text
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

      const MIN_REPEATS = 6;
      const TOP_N = 20;

      function countRepeats(number) {
        const freq = {};
        for (const digit of number) {
          freq[digit] = (freq[digit] || 0) + 1;
        }
        return Math.max(...Object.values(freq));
      }

      const results = [];

      for (const line of lines) {
        // TOMAR LA LÍNEA EXACTA como aparece en TXT
        const digits = line.replace(/\D/g, "");

        if (digits.length < 8) continue;

        // Usar TODO el número, no solo últimas 8
        const repeatCount = countRepeats(digits);

        if (repeatCount >= MIN_REPEATS) {
          results.push({
            original: line,   // ← EXACTO como viene en el TXT
            digits,
            repeats: repeatCount
          });
        }
      }

      if (results.length === 0) {
        return sock.sendMessage(ctx.jid, {
          text: `❌ No hay números con al menos ${MIN_REPEATS} dígitos repetidos.`
        });
      }

      // Ordenarlos de mayor a menor
      results.sort((a, b) => b.repeats - a.repeats);

      const top = results.slice(0, TOP_N);

      let msgOut = `📊 *TOP ${top.length} — NÚMEROS CON MÁS REPETIDOS*\n`;
      msgOut += `📌 (mínimo ${MIN_REPEATS} dígitos repetidos)\n\n`;

      for (const r of top) {
        msgOut += `🔹 ${r.original}\n`;
        msgOut += `   ➤ Repetidos: *${r.repeats}*\n\n`;
      }

      await sock.sendMessage(ctx.jid, { text: msgOut });

    } catch (err) {
      console.error("CHECKER ERROR:", err);
      return sock.sendMessage(ctx.jid, {
        text: "❌ Error procesando el TXT."
      });
    }
  }
};
