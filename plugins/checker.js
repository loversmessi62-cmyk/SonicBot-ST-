export default {
    commands: ["checker", "check"],
    category: "tools",

    async run(sock, msg, args, ctx) {
        try {
            const media = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isTxt =
                media?.documentMessage &&
                media.documentMessage.mimetype === "text/plain";

            if (!isTxt)
                return sock.sendMessage(ctx.jid, {
                    text: "📄 *Responde a un archivo TXT para analizar los números.*"
                });

            const buffer = await ctx.download();
            const textContent = buffer.toString("utf8");

            // Extraer líneas completas que parezcan números
            const lines = textContent.split(/\r?\n/).map(l => l.trim());

            const results = [];

            for (let line of lines) {
                if (!line) continue;

                // Extraer solo dígitos
                const digits = line.replace(/\D/g, "");

                // Necesitamos al menos los últimos 8 dígitos reales
                const last8 = digits.slice(-8);

                if (last8.length !== 8) continue;

                // Contemos repeticiones
                const counts = {};
                for (let c of last8) {
                    counts[c] = (counts[c] || 0) + 1;
                }

                // Buscar si alguna cifra se repite 5+
                const best = Object.entries(counts)
                    .filter(([d, c]) => c >= 5)
                    .sort((a, b) => b[1] - a[1]); // de mayor repetición a menor

                if (best.length === 0) continue;

                results.push({
                    original: line,
                    digit: best[0][0],
                    count: best[0][1]
                });
            }

            if (results.length === 0)
                return sock.sendMessage(ctx.jid, {
                    text: "❌ No se encontraron números con *mínimo 5 cifras repetidas* en las últimas 8 cifras."
                });

            // Ordenar del que tiene más repeticiones → menos
            results.sort((a, b) => b.count - a.count);

            let out = "📊 *NÚMEROS CON REPETICIONES (5+ dentro de las últimas 8 cifras)*\n\n";

            for (let r of results) {
                out += `🔹 ${r.original}\n`;
                out += `   ➤ Repite: *${r.digit}* (${r.count} veces)\n\n`;
            }

            await sock.sendMessage(ctx.jid, { text: out });

        } catch (e) {
            console.error("CHECKER ERROR:", e);
            return sock.sendMessage(ctx.jid, {
                text: "❌ Ocurrió un error procesando el TXT."
            });
        }
    }
};
