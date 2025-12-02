import { Sticker, StickerTypes } from "wa-sticker-formatter";

export default {
    commands: ["s", "sticker", "stiker"],
    alias: ["st"],
    category: "stickers",

    async run(sock, msg, args) {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            const mime = quoted?.imageMessage
                ? "image"
                : quoted?.videoMessage
                ? "video"
                : null;

            if (!mime)
                return sock.sendMessage(msg.key.remoteJid, { text: "❌ Responde una imagen o video." });

            const buffer = await sock.downloadMediaMessage({
                message: quoted
            });

            const sticker = new Sticker(buffer, {
                type: StickerTypes.FULL,
                quality: 70,           // evitar gris
                pack: "",              // evitar errores EXIF
                author: "",            // evitar errores EXIF
            });

            await sock.sendMessage(msg.key.remoteJid, { 
                sticker: await sticker.build()
            });

        } catch (e) {
            console.log("STICKER ERROR:", e);
            sock.sendMessage(msg.key.remoteJid, { text: "❌ Falló el sticker." });
        }
    }
};
