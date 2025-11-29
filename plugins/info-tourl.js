import uploadFile from "../lib/uploadFile.js";
import uploadImage from "../lib/uploadImage.js";

export default {
    name: "tourl",
    alias: ["upload", "tourl"],
    desc: "Convierte imagen/video en URL",

    run: async (sock, m, args) => {
        try {
            let q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
                ? m.message.extendedTextMessage.contextInfo
                : null;

            // Si no respondió a nada → usar mensaje directo
            let quoted = q ? q.quotedMessage : m.message;

            // Detectar mime
            let mime =
                quoted?.imageMessage?.mimetype ||
                quoted?.videoMessage?.mimetype ||
                quoted?.stickerMessage?.mimetype ||
                null;

            if (!mime) {
                return sock.sendMessage(m.key.remoteJid, {
                    text: "⚠️ *Responde a una imagen, video o sticker para convertirlo a URL.*"
                });
            }

            // Descargar media
            let buffer = await sock.downloadMediaMessage({
                message: quoted
            });

            if (!buffer) {
                return sock.sendMessage(m.key.remoteJid, {
                    text: "❌ No pude descargar el archivo."
                });
            }

            let url;
            if (/image/.test(mime)) {
                url = await uploadImage(buffer);
            } else {
                url = await uploadFile(buffer);
            }

            await sock.sendMessage(m.key.remoteJid, {
                text: `✅ *Archivo subido correctamente*\n📎 URL:\n${url}`
            });

        } catch (e) {
            console.error("ERROR TOUR:", e);
            await sock.sendMessage(m.key.remoteJid, {
                text: "❌ Error subiendo el archivo."
            });
        }
    }
};
