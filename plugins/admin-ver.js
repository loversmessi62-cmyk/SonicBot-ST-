export default {
    commands: ["ver"],
    category: "admin",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Debe responder a un mensaje
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.quotedMessage) {
            return sock.sendMessage(jid, { text: "⚠️ Responde a una imagen o video." });
        }

        const qm = quoted.quotedMessage;

        // ===== IMAGEN =====
        if (qm.imageMessage) {
            const buffer = await sock.downloadMediaMessage({
                message: qm,
                key: { remoteJid: jid, id: msg.key.id }
            });

            return sock.sendMessage(
                jid,
                { image: buffer } // sin caption, sin citar
            );
        }

        // ===== VIDEO =====
        if (qm.videoMessage) {
            const buffer = await sock.downloadMediaMessage({
                message: qm,
                key: { remoteJid: jid, id: msg.key.id }
            });

            return sock.sendMessage(
                jid,
                { video: buffer } // sin caption, sin citar
            );
        }

        // Si no es imagen o video
        return sock.sendMessage(jid, { text: "❌ Solo funciona con imágenes o videos." });
    },
};
