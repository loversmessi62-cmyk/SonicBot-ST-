export default {
    commands: ["hidetag", "n", "notify", "notificar"],
    category: "admin",
    admin: true,
    group: true,

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;
        const isGroup = ctx.isGroup;

        if (!isGroup)
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        // OBTENER LISTA DE TODOS LOS MIEMBROS
        const groupInfo = await sock.groupMetadata(jid);
        const participantes = groupInfo.participants.map(p => p.id);

        // TEXTO DEL COMANDO
        let texto = args.join(" ").trim();

        // SI RESPONDES A UN MENSAJE
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedInfo = msg.message?.extendedTextMessage?.contextInfo;

        let mediaBuffer = null;
        let tipo = "text";

        if (quoted) {
            // Detectamos si el mensaje citado tiene multimedia
            if (quoted.imageMessage) {
                mediaBuffer = await ctx.download(quoted.imageMessage);
                tipo = "image";
                texto = texto || quoted.imageMessage.caption || "";
            } else if (quoted.videoMessage) {
                mediaBuffer = await ctx.download(quoted.videoMessage);
                tipo = "video";
                texto = texto || quoted.videoMessage.caption || "";
            } else if (quoted.audioMessage) {
                mediaBuffer = await ctx.download(quoted.audioMessage);
                tipo = "audio";
            } else if (quoted.stickerMessage) {
                mediaBuffer = await ctx.download(quoted.stickerMessage);
                tipo = "sticker";
            } else if (quoted.conversation || quoted.extendedTextMessage) {
                texto = texto || quoted.conversation || quoted.extendedTextMessage?.text || "";
            }
        }

        // SI NO HAY TEXTO Y NO HAY MEDIA → ERROR
        if (!texto && !mediaBuffer) {
            return sock.sendMessage(jid, {
                text: "⚠️ Escribe un mensaje, o responde a un texto/imagen/video."
            }, { quoted: msg });
        }

        // LISTA DE MENCIONES = todos los del grupo
        const mentions = participantes;

        // ========= ENVÍO SEGÚN EL TIPO =========

        if (tipo === "image") {
            return await sock.sendMessage(
                jid,
                {
                    image: mediaBuffer,
                    caption: texto,
                    mentions
                },
                { quoted: msg }
            );
        }

        if (tipo === "video") {
            return await sock.sendMessage(
                jid,
                {
                    video: mediaBuffer,
                    caption: texto,
                    mentions,
                    mimetype: "video/mp4"
                },
                { quoted: msg }
            );
        }

        if (tipo === "audio") {
            return await sock.sendMessage(
                jid,
                {
                    audio: mediaBuffer,
                    mentions,
                    mimetype: "audio/mpeg"
                },
                { quoted: msg }
            );
        }

        if (tipo === "sticker") {
            return await sock.sendMessage(
                jid,
                {
                    sticker: mediaBuffer,
                    mentions
                },
                { quoted: msg }
            );
        }

        // MENSAJE NORMAL
        return await sock.sendMessage(
            jid,
            {
                text: texto,
                mentions
            },
            { quoted: msg }
        );
    }
};
