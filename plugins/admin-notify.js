export default {
    commands: ["n", "notify", "hidetag"],
    category: "admin",
    admin: true,

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;
        const texto = args.join(" ").trim();

        // Obtener a todos los usuarios del grupo
        const participants = ctx.participants || [];
        const mentions = participants.map(p => p.id);

        const quoted = msg.message?.extendedTextMessage?.contextInfo;

        // ================================================
        // 1. SI RESPONDES A UN MENSAJE → REENVIARLO SIN CITAR
        // ================================================
        if (quoted?.quotedMessage) {
            const qm = quoted.quotedMessage;

            // ─────── SI ES TEXTO ───────
            if (qm.conversation || qm.extendedTextMessage?.text) {
                const textReply =
                    texto ||
                    qm.conversation ||
                    qm.extendedTextMessage?.text;

                return await sock.sendMessage(
                    jid,
                    { text: textReply, mentions }
                );
            }

            // ─────── SI ES IMAGEN ───────
            if (qm.imageMessage) {
                const buffer = await sock.downloadMediaMessage({
                    message: qm,
                    key: { remoteJid: jid, id: msg.key.id }
                });

                return await sock.sendMessage(
                    jid,
                    { 
                        image: buffer,
                        caption: texto || qm.imageMessage.caption || "",
                        mentions
                    }
                );
            }

            // ─────── SI ES VIDEO ───────
            if (qm.videoMessage) {
                const buffer = await sock.downloadMediaMessage({
                    message: qm,
                    key: { remoteJid: jid, id: msg.key.id }
                });

                return await sock.sendMessage(
                    jid,
                    { 
                        video: buffer,
                        caption: texto || qm.videoMessage.caption || "",
                        mentions
                    }
                );
            }

            // ─────── SI ES STICKER ───────
            if (qm.stickerMessage) {
                const buffer = await sock.downloadMediaMessage({
                    message: qm,
                    key: { remoteJid: jid, id: msg.key.id }
                });

                return await sock.sendMessage(
                    jid,
                    { sticker: buffer, mentions }
                );
            }

            // ─────── SI ES AUDIO ───────
            if (qm.audioMessage) {
                const buffer = await sock.downloadMediaMessage({
                    message: qm,
                    key: { remoteJid: jid, id: msg.key.id }
                });

                return await sock.sendMessage(
                    jid,
                    { audio: buffer, mimetype: "audio/mpeg", mentions }
                );
            }
        }

        // ================================================
        // 2. SI NO RESPONDE → SOLO TEXTO SIN CITAR
        // ================================================
        if (!texto)
            return sock.sendMessage(
                jid,
                { text: "⚠️ Escribe un texto o responde a un mensaje." }
            );

        return await sock.sendMessage(
            jid,
            { text: texto, mentions }
        );
    }
};
