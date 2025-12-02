export default {
    commands: ["n", "notify", "hidetag"],
    category: "admin",
    admin: true,

    async run(sock, msg, args, ctx) {
        try {
            const jid = msg.key.remoteJid;
            const texto = args.join(" ").trim();
            const participants = ctx.participants || [];
            const mentions = participants.map(p => p.id);
            const quoted = msg.message?.extendedTextMessage?.contextInfo;

            // =====================================
            // 1. SI RESPONDES A UN MENSAJE
            // =====================================
            if (quoted?.quotedMessage) {
                const qm = quoted.quotedMessage;

                // Detectar cualquier tipo de mensaje
                const mediaTypes = ["imageMessage", "videoMessage", "stickerMessage", "audioMessage"];
                let buffer;

                // ---- TEXTO RESPONDIDO ----
                if (qm.conversation || qm.extendedTextMessage?.text) {
                    return await sock.sendMessage(jid, {
                        text:
                            texto ||
                            qm.conversation ||
                            qm.extendedTextMessage?.text,
                        mentions
                    });
                }

                // ---- MEDIOS RESPONDIDOS ----
                for (const type of mediaTypes) {
                    if (qm[type]) {
                        buffer = await sock.downloadMediaMessage({
                            message: { [type]: qm[type] }
                        });

                        const sendObj = {
                            mentions
                        };

                        if (type === "imageMessage") {
                            sendObj.image = buffer;
                            sendObj.caption = texto || qm.imageMessage.caption || "";
                        }
                        if (type === "videoMessage") {
                            sendObj.video = buffer;
                            sendObj.caption = texto || qm.videoMessage.caption || "";
                        }
                        if (type === "stickerMessage") {
                            sendObj.sticker = buffer;
                        }
                        if (type === "audioMessage") {
                            sendObj.audio = buffer;
                            sendObj.mimetype = qm.audioMessage.mimetype || "audio/mpeg";
                        }

                        return await sock.sendMessage(jid, sendObj);
                    }
                }

                return;
            }

            // =====================================
            // 2. SI NO RESPONDES → HIDETAG TEXTO
            // =====================================
            if (!texto)
                return await sock.sendMessage(jid, {
                    text: "⚠️ Escribe un texto o responde a un mensaje."
                });

            // Notificación real
            return await sock.sendMessage(jid, {
                text: texto,
                mentions
            });

        } catch (err) {
            console.error("❌ ERROR EN HIDETAG:", err);
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Ocurrió un error al enviar el notify."
            });
        }
    }
};
