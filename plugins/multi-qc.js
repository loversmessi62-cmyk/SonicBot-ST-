export default {
    commands: ["qc"],
    category: "stickers",
    
    async run(sock, msg, args, ctx) {
        const { jid } = ctx;
        const text = args.join(" ");

        if (!text)
            return sock.sendMessage(jid, { text: "⚠️ Escribe un texto para generar el QC.\nEjemplo:\n.qc Hola" }, { quoted: msg });

        await sock.sendMessage(jid, { text: "🎨 Generando QC..." }, { quoted: msg });

        // API estilo WhatsApp QC real
        const url = `https://api.xzere.dev/api/qc?text=${encodeURIComponent(text)}&username=${encodeURIComponent(msg.pushName)}`;

        try {
            await sock.sendMessage(
                jid,
                { sticker: { url } },
                { quoted: msg }
            );
        } catch (e) {
            console.log("Error QC:", e);
            return sock.sendMessage(jid, { text: "❌ No se pudo generar el QC." }, { quoted: msg });
        }
    }
};
