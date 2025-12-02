import { makeSticker } from "../utils/sticker-func.js";


export default {
    name: "multi-sticker",
    commands: ["s", "sticker", "stk"],
    alias: ["stiker", "stick"],
    category: "fun",
    description: "Convierte imágenes, videos, gifs, textos y urls en stickers",

    async run(sock, msg, args) {
        const { remoteJid } = msg.key;

        // Si la imagen/video está citada
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        // Si el usuario mandó archivo directo
        const msgType = Object.keys(msg.message)[0];

        let mediaBuffer = null;

        // =============================
        //        OBTENER MEDIOS
        // =============================

        // 1. Mensaje citado
        if (quoted) {
            const quotedType = Object.keys(quoted)[0];
            mediaBuffer = await sock.downloadMediaMessage({ message: quoted });
        }

        // 2. Archivo enviado directo
        else if (msgType === "imageMessage" || msgType === "videoMessage") {
            mediaBuffer = await sock.downloadMediaMessage(msg);
        }

        // 3. Es texto → convertir texto en sticker
        else if (msgType === "conversation" || msgType === "extendedTextMessage") {
            const text = args.join(" ");
            if (!text) return sock.sendMessage(remoteJid, { text: "⚠️ Manda una imagen/video o escribe un texto." });

            const buffer = Buffer.from(
                `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
                    <rect width="100%" height="100%" fill="white"/>
                    <text x="50%" y="50%" font-size="42" text-anchor="middle" fill="black" dy=".3em">${text}</text>
                </svg>`
            );

            const stickerBuffer = await createSticker(buffer);
            return sock.sendMessage(remoteJid, { sticker: stickerBuffer });
        }

        // 4. Nada válido
        else {
            return sock.sendMessage(remoteJid, { text: "⚠️ Manda una imagen/video o texto para hacer sticker." });
        }

        // =============================
        //     CREAR STICKER FINAL
        // =============================

        const stickerBuffer = await createSticker(mediaBuffer);

        await sock.sendMessage(remoteJid, {
            sticker: stickerBuffer
        });
    }
};
