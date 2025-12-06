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

            const numbers = textContent.match(/\+?\d+/g) || [];

            if (numbers.length === 0)
                return sock.sendMessage(ctx.jid, { text: "❌ El TXT no contiene números." });

            // Buscar bloques como 111, 2222, 3333, etc.
            const blockRegex = /(0{3,}|1{3,}|2{3,}|3{3,}|4{3,}|5{3,}|6{3,}|7{3,}|8{3,}|9{3,})/;

            const filtered = numbers
                .filter(num => blockRegex.test(num))
                .map(num => {
                    const matches = [...num.matchAll(blockRegex)].map(m => m[0]);
                    return { num, blocks: matches };
                });

            if (filtered.length === 0)
                return sock.sendMessage(ctx.jid, {
                    text: "❌ No se encontraron números con bloques repetidos (ej: 4444, 3333, 2222)."
                });

            // Ordenar por el bloque más largo (primero los más repetidos)
            filtered.sort((a, b) => {
                const maxA = Math.max(...a.blocks.map(x => x.length));
                const maxB = Math.max(...b.blocks.map(x => x.length));
                return maxB - maxA;
            });

            let out = "📊 *NÚMEROS CON BLOQUES REPETIDOS (tipo 4444, 3333, 2222)*\n\n";

            for (const f of filtered) {
                out += `🔹 ${f.num}\n`;
                out += `   ➤ Bloques: ${f.blocks.join(", ")}\n\n`;
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
