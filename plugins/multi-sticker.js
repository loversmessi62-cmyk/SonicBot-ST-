import baileys from "@whiskeysockets/baileys";
const { downloadMediaMessage } = baileys;

export default {
    commands: ["s", "sticker"],

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // detectar media
        const m = msg.message;
        let target = null;

        if (m.imageMessage) target = msg;
        else if (m.videoMessage) target = msg;
        else if (m?.extendedTextMessage?.contextInfo?.quotedMessage) {
            target = {
                message: m.extendedTextMessage.contextInfo.quotedMessage
            };
        } else if (m?.viewOnceMessageV2?.message) {
            target = { message: m.viewOnceMessageV2.message };
        }

        if (!target) {
            return sock.sendMessage(jid, {
                text: "⚠️ *Responde a una imagen o video con .s*"
            }, { quoted: msg });
        }

        // aquí SÍ descarga el archivo real, completo, no la miniatura
        let buffer;
        try {
            buffer = await downloadMediaMessage(
                target,
                "buffer",
                {},
                {
                    reuploadRequest: sock.updateMediaMessage
                }
            );
        } catch (e) {
            console.log(e);
            return sock.sendMessage(jid, {
                text: "❌ No pude descargar el archivo."
            }, { quoted: msg });
        }

        // enviar sticker real
        try {
            await sock.sendMessage(jid, { sticker: buffer }, { quoted: msg });
        } catch (e) {
            console.log(e);
            return sock.sendMessage(jid, {
                text: "❌ Error creando el sticker."
            }, { quoted: msg });
        }
    }
};
