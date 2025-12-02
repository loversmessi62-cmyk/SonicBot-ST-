export default {
    commands: ["brat"],
    category: "stickers",

    async run(sock, msg, args, ctx) {
        const { jid } = ctx;
        const text = args.join(" ");

        if (!text)
            return sock.sendMessage(jid, { text: "⚠️ Escribe algo para generar el sticker brat.\nEjemplo:\n.brat prueba" }, { quoted: msg });

        await sock.sendMessage(jid, { text: "🍑 Generando tu sticker brat..." }, { quoted: msg });

        // API estilo BRAT (fondo blanco, letras grandes)
        const url = `https://api.xzere.dev/api/brat?text=${encodeURIComponent(text)}`;

        try {
            await sock.sendMessage(
                jid,
                { sticker: { url } },
                { quoted: msg }
            );
        } catch (e) {
            console.log("Error BRAT:", e);
            return sock.sendMessage(jid, { text: "❌ Error generando el sticker brat." }, { quoted: msg });
        }
    }
};
