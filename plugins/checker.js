export default {
  commands: ["checker", "check", "chacker"], // acepto typo .chacker
  category: "tools",

  async run(sock, msg, args, ctx) {
    try {
      // --- 1) detectar el archivo TXT: puede venir como "quoted" o como el mismo mensaje con documentMessage
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const selfDoc = msg.message?.documentMessage;
      const doc = quoted?.documentMessage || selfDoc;

      if (!doc) {
        return sock.sendMessage(ctx.jid, {
          text: "📄 *Responde a un archivo TXT o envía el TXT junto al comando.*"
        });
      }

      // comprobar mimetype (acepta text/plain o application/octet-stream por si el cliente cambia)
      const mimetype = doc.mimetype || "";
      if (!mimetype.includes("text") && !mimetype.includes("plain") && !mimetype.includes("octet-stream")) {
        // aún así intentamos descargar porque algunos clientes mandan otros mimetypes
        // pero avisamos al usuario
        await sock.sendMessage(ctx.jid, {
          text: "⚠️ Aviso: el archivo no parece ser text/plain. Intentando procesar..."
        });
      }

      // --- 2) descargar el archivo (usa ctx.download() corregido en tu handler)
      let buffer;
      try {
        buffer = await ctx.download();
      } catch (e) {
        console.error("DOWNLOAD ERROR:", e);
        return sock.sendMessage(ctx.jid, {
          text: "❌ Error descargando el archivo. Asegúrate de haber actualizado ctx.download() en tu handler."
        });
      }

      const textContent = buffer.toString("utf8");

      // --- 3) extraer líneas y limpiar
      const lines = textContent
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

      if (lines.length === 0) {
        return sock.sendMessage(ctx.jid, { text: "❌ El TXT está vacío." });
      }

      // --- 4) configuración: cuántos últimos dígitos mirar, mínimo repeticiones y cuantos top devolver
      const LAST_N = 8;     // últimas 8 cifras
      const MIN_REPEATS = 1; // filtro mínimo para entrar (lo puedes subir a 6 si quieres)
      const TOP_N = 10;     // top 10

      // función que cuenta la mayor repetición de un dígito dentro del segmento (no necesariamente consecutivos)
      function maxDigitRepeats(segment) {
        const counts = {};
        for (const ch of segment) {
          if (!/[0-9]/.test(ch)) continue;
          counts[ch] = (counts[ch] || 0) + 1;
        }
        const vals = Object.values(counts);
        return vals.length ? Math.max(...vals) : 0;
      }

      // analizar todos los números
      const evaluated = [];
      for (const line of lines) {
        // extraer solo dígitos
        const digits = line.replace(/\D/g, "");
        if (digits.length < LAST_N) continue;

        const lastSegment = digits.slice(-LAST_N); // últimas 8 cifras
        const repeats = maxDigitRepeats(lastSegment);

        if (repeats >= MIN_REPEATS) {
          evaluated.push({
            original: line,
            digits,
            lastSegment,
            repeats
          });
        }
      }

      if (evaluated.length === 0) {
        return sock.sendMessage(ctx.jid, {
          text: `❌ No se encontraron números con la condición (mínimo ${MIN_REPEATS} repeticiones en las últimas ${LAST_N} cifras).`
        });
      }

      // ordenar por repeats (mayor primero) y tomar TOP_N
      evaluated.sort((a, b) => b.repeats - a.repeats);
      const top = evaluated.slice(0, TOP_N);

      // construir mensaje
      let out = `📊 *TOP ${top.length} — Números con más dígitos repetidos (en últimas ${LAST_N} cifras)*\n\n`;
      for (const it of top) {
        out += `🔹 ${it.original}\n`;
        out += `   ➤ Últimas ${LAST_N}: ${it.lastSegment} — dígito más repetido: ${it.repeats} veces\n\n`;
      }

      await sock.sendMessage(ctx.jid, { text: out });

    } catch (err) {
      console.error("CHECKER PLUGIN ERROR:", err);
      await sock.sendMessage(ctx.jid, {
        text: "❌ Ocurrió un error inesperado ejecutando el checker."
      });
    }
  }
};
