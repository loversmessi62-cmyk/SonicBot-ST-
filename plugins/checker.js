export default {
    commands: ["checker", "check"],
    category: "tools",

    async run(sock, msg, args, ctx) {
        try {
            // ------------------------------
            // Validar si respondió a un TXT
            // ------------------------------
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

            // Extraer números
            const numbers = textContent.match(/\d+/g);

            if (!numbers || numbers.length === 0)
                return sock.sendMessage(ctx.jid, {
                    text: "❌ El TXT no contiene números."
                });

            // Agrupar por número de cifras
            const groups = {};
            for (let num of numbers) {
                const len = num.length;
                if (!groups[len]) groups[len] = [];
                groups[len].push(num);
            }

            // Formar mensaje
            let out = "📊 *CHECKER DE NÚMEROS*\n\n";

            const sortedKeys = Object.keys(groups).sort((a, b) => a - b);

            for (let k of sortedKeys) {
                out += `🔹 *${k} cifras:* (${groups[k].length})\n`;
                out += groups[k].join(", ") + "\n\n";
            }

            // Enviar resultado
            await sock.sendMessage(ctx.jid, { text: out });

        } catch (e) {
            console.error("CHECKER ERROR:", e);
            return sock.sendMessage(ctx.jid, {
                text: "❌ Ocurrió un error procesando el TXT."
            });
        }
    }
};
