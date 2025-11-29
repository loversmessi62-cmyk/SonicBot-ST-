import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default {
    commands: ["tourl"],

    async run(sock, msg, args, ctx) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: "📌 *Responde a una imagen, sticker o video con:* .tourl"
            });
        }

        const buffer = await downloadMediaMessage(
            { message: quoted },
            "buffer",
            {},
            { logger: null }
        );

        const uploaded = await sock.sendMessage(msg.key.remoteJid, {
            image: buffer,
            caption: "📎 *Aquí tienes tu link (WhatsApp CDN se activa al reenviar)*"
        });

        const url = uploaded.message.imageMessage?.directPath;

        await sock.sendMessage(msg.key.remoteJid, {
            text: `🔗 *LINK OBTENIDO:*\nhttps://mmg.whatsapp.net${url}`
        });
    }
};
