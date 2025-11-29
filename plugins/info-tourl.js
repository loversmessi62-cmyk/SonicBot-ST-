import uploadFile from "../lib/uploadFile.js";
import uploadImage from "../lib/uploadImage.js";
import { download } from "../handler.js";

export default {
    name: "tourl",
    alias: ["upload", "tourl"],
    desc: "Convierte imagen/video en URL",

    run: async (sock, m, args) => {
        try {
            const jid = m.key.remoteJid;

            // Obtener mensaje citado o el mismo mensaje
            const quoted =
                m.message?.extendedTextMessage?.contextInfo?.quotedMessage
                    ? { message: m.message.extendedTextMessage.contextInfo.quotedMessage }
                    : m;

            // Detectar mime
            const msg = quoted.message;
            const mime =
                msg?.imageMessage?.mimetype ||
                msg?.videoMessage?.mimetype ||
                msg?.stickerMessage?.mimetype ||
                null;

            if (!mime) {
                return sock.sendMessage(jid, {
                    text: "⚠️ *Responde a una imagen, video o sticker para convertirlo a URL.*"
                });
            }

            // Descargar usando función global de tu handler
            const buffer = await download(sock, quoted);

            if (!buffer) {
                return sock.sendMessage(jid, {
                    text: "❌ No pude descargar el archivo."
                });
            }

            // Subir archivo
            let url;
            if (/image/.test(mime)) url = await uploadImage(buffer);
            else url = await uploadFile(buffer);

            await sock.sendMessage(jid, {
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
