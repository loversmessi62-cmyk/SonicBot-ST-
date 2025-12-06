export default {
    commands: ["checker", "check", "chacker"],
    category: "tools",

    async run(sock, msg, args, ctx) {
        try {
            // Detectar el TXT
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const doc = quoted?.documentMessage || msg.message?.documentMessage;

            if (!doc) {
                return sock.sendMessage(ctx.jid, {
                    text: "📄 *Responde a un archivo TXT o envíalo con el comando.*"
                });
            }

            // Descargar
            const buffer = await ctx.download();
            const text = buffer.toString("utf8");

            // Separar líneas exactas
            const lines = text
                .split(/\r?\n/)
                .map(l => l.trim())
                .filter(l => l.length > 0);

            const results = [];

            for (const original of lines) {
                // Sacar solo números
                const digits = original.replace(/\D/g, "");

                // Si no hay número válido → ignorar
                if (digits.length < 6) continue;

                // Contar repeticiones
                const count = {};
                for (const d of digits) {
                    count[d] = (count[d] || 0) + 1;
                }

                const maxRepeats = Math.max(...Object.values(count));

                // Solo tomar números con mínimo 6 repetidos
                if (maxRepeats >= 6) {
                    results.push({
                        original,      // TAL CUAL aparece en el TXT
                        digits,
                        maxRepeats
                    });
                }
            }

            if (results.length === 0) {
                return sock.sendMessage(ctx.jid, {
                    text: "❌ No hay números con mínimo 6 dígitos repetidos."
                });
            }

            // Ordenar por más repetidos
            results.sort((a, b) => b.maxRepeats - a.maxRepeats);

            // Tomar top 10
            const top = results.slice(0, 10);

            // Armar mensaje
            let out = "📊 *TOP 10 – NÚMEROS CON MÁS REPETIDOS*\n\n";

            for (const r of top) {
                out += `🔹 ${r.original}\n`;
                out += `   ➤ Repetidos máximos de un mismo dígito: *${r.maxRepeats}*\n\n`;
            }

            await sock.sendMessage(ctx.jid, { text: out });

        } catch (e) {
            console.error("CHECKER ERROR:", e);
            await sock.sendMessage(ctx.jid, {
                text: "❌ Error procesando el TXT."
            });
        }
    }
};
