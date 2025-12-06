export default {
    commands: ["checker", "check"],
    category: "tools",

    async run(sock, msg, args, ctx) {
        try {
            // Revisar si respondió a un TXT
            const media = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isTxt =
                media?.documentMessage &&
                media.documentMessage.mimetype === "text/plain";

            if (!isTxt)
                return sock.sendMessage(ctx.jid, {
                    text: "📄 *Responde a un archivo TXT para analizar los números.*"
                });

            // Descargar TXT
            const buffer = await ctx.download();
            const textContent = buffer.toString("utf8");

            // Extraer números completos
            const numbers = textContent.match(/\d+/g) || [];

            if (numbers.length === 0)
                return sock.sendMessage(ctx.jid, {
                    text: "❌ El TXT no contiene números."
                });

            // Función para contar repeticiones
            const countRepeats = (num) => {
                const map = {};
                for (let c of num) {
                    map[c] = (map[c] || 0) + 1;
                }
                // Total de caracteres repetidos (solo los que se repiten)
                return Object.values(map).filter(v => v > 1).reduce((a, b) => a + b, 0);
            };

            // Filtrar solo números con repeticiones
            const withRepeats = numbers
                .map(n => ({ num: n, rep: countRepeats(n) }))
                .filter(x => x.rep > 0);

            if (withRepeats.length === 0)
                return sock.sendMessage(ctx.jid, {
                    text: "❌ No hay números con cifras repetidas."
                });

            // Ordenar de mayor repetición → menor repetición
            withRepeats.sort((a, b) => b.rep - a.rep);

            // Construir mensaje
            let out = "📊 *CHECKER — Números con cifras repetidas*\n\n";

            for (let item of withRepeats) {
                out += `🔹 ${item.num} — *${item.rep} repeticiones*\n`;
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
