export default {
    commands: ["checker", "check", "chacker"],
    category: "tools",

    async run(sock, msg, args, ctx) {
        try {
            // Detectar documento TXT (respondido o enviado con el comando)
            const q = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const doc = q?.documentMessage || msg.message?.documentMessage;

            if (!doc || doc.mimetype !== "text/plain") {
                return sock.sendMessage(ctx.jid, {
                    text: "📄 *Responde a un archivo TXT o envíalo con el comando.*"
                });
            }

            // Descargar archivo
            const buffer = await ctx.download();
            const text = buffer.toString("utf8");

            // Leer líneas EXACTAS del TXT
            const lines = text
                .split(/\r?\n/)
                .map(l => l.trim())
                .filter(l => l.length > 0);

            // Config
            const LAST_N = 8;      // analizar últimas 8 cifras
            const MIN_REPEATS = 6; // mínimo dígitos repetidos
            const TOP = 10;

            function countRepeats(str) {
                const map = {};
                for (const x of str) {
                    if (/[0-9]/.test(x)) {
                        map[x] = (map[x] || 0) + 1;
                    }
                }
                return Math.max(0, ...Object.values(map));
            }

            const found = [];

            for (const line of lines) {
                // Extraemos solo dígitos pero conservamos la línea ORIGINAL
                const digits = line.replace(/\D/g, "");

                if (digits.length < LAST_N) continue;

                const segment = digits.slice(-LAST_N);
                const repeats = countRepeats(segment);

                if (repeats >= MIN_REPEATS) {
                    found.push({
                        original: line,     // tal cual viene en el TXT
                        segment,
                        repeats
                    });
                }
            }

            if (found.length === 0) {
                return sock.sendMessage(ctx.jid, {
                    text: `❌ No se encontraron números con mínimo ${MIN_REPEATS} dígitos repetidos.`
                });
            }

            // Ordenar por los que más repiten
            found.sort((a, b) => b.repeats - a.repeats);

            const top = found.slice(0, TOP);

            let msgOut = `📊 *TOP ${top.length} NÚMEROS DEL TXT CON MÁS REPETIDOS*\n`;
            msgOut += `📌 (últimas ${LAST_N} cifras, mínimo ${MIN_REPEATS} repetidos)\n\n`;

            for (const f of top) {
                msgOut += `🔹 ${f.original}\n`;
                msgOut += `   ➤ ${f.segment} → *${f.repeats} repetidos*\n\n`;
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
