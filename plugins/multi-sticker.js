import { Sticker, StickerTypes } from "wa-sticker-formatter";

export default {
    commands: ["sticker", "s"],
    category: "multi",
    admin: false,
    description: "Convierte una imagen en sticker.",

    async run(sock, msg, args, ctx) {
        const { jid, download } = ctx;

        // ==================================================
        //         DESCARGAR IMAGEN (QUOTE O DIRECTA)
        // ==================================================
        let mediaBuffer;
        try {
            mediaBuffer = await download();
        } catch {
            return sock.sendMessage(
                jid,
                { text: "❌ Envía o responde una *imagen*." },
                { quoted: msg }
            );
        }

        // Validar que sea imagen
        const mime =
            msg.message?.imageMessage?.mimetype ||
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage?.mimetype;

        if (!mime || !mime.includes("image/")) {
            return sock.sendMessage(
                jid,
                { text: "❌ El archivo no es una imagen válida." },
                { quoted: msg }
            );
        }

        // ==================================================
        //          CONVERTIR A WEBP REAL (STICKER)
        // ==================================================
        try {
            const sticker = new Sticker(mediaBuffer, {
                pack: "Diamond Bot",
                author: "Adri",
                type: StickerTypes.FULL,
                quality: 80,
            });

            const webpBuffer = await sticker.toBuffer();

            await sock.sendMessage(
                jid,
                { sticker: webpBuffer },
                { quoted: msg }
            );
        } catch (err) {
            console.log("❌ Error generando sticker:", err);
            return sock.sendMessage(
                jid,
                { text: "⚠️ Ocurrió un error al generar el sticker." },
                { quoted: msg }
            );
        }
    },
};
