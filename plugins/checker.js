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

            const lines = textContent.split(/\r?\n/).map(l => l.trim());

            // Detectar bloques repetidos de mínimo 6 seguidos
            const blockRegex = /(0{6,}|1{6,}|2{6,}|3{6,}|4{6,}|5{6,}|6{6,}|7{6,}|8{6,}|9{6,})/;

            const results = [];

            for (let line of lines) {
                if (!line) continue;

                const digits = line.replace(/\D/g, "");
                const last8 = digits.slice(-8);

                if (last8.length !== 8) continue;

                const match = last8.match(blockRegex);

                if (match) {
                    results.push({
                        original: line,
                        block: match[0],
                        len: match[0].length
                    });
                }
            }

            if (results.length === 0)
                return sock.sendMessage(ctx.jid, {
                    text: "❌ No se encontraron números con bloques repetidos de *mínimo 6 seguidos*."
                });

            // Ordenar por bloque más largo
            results.sort((a, b) => b.len - a.len);

            let out = "📊 *NÚMEROS CON BLOQUES REPETIDOS (mínimo 6 seguidos)*\n\n";

            for (const r of results) {
                out += `🔹 ${r.original}\n`;
                out += `   ➤ Bloque: *${r.block}* (${r.len} seguidos)\n\n`;
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
