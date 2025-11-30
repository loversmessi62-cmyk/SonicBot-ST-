import uploadFile from "../lib/uploadFile.js";
import uploadImage from "../lib/uploadImage.js";

export default {
    name: "tourl",
    commands: ["tourl", "upload", "toimg"],
    desc: "Convierte imagen, video o sticker a URL.",

    run: async (sock, m, args, ctx) => {
        try {
            const jid = m.key.remoteJid;

            // -----------------------------
            // 1) OBTENER MENSAJE CITADO O EL PROPIO
            ------------------------------
            const quoted =
                m.message?.extendedTextMessage?.contextInfo?.quotedMessage
                    ? { message: m.message.extendedTextMessage.contextInfo.quotedMessage }
                    : m;

            const msg = quoted.message;

            // -----------------------------
            // 2) DETECTAR MIME
            // -----------------------------
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

            // -----------------------------
            // 3) DESCARGAR USANDO ctx.download
            // -----------------------------
            const buffer = await ctx.download(sock, quoted);

            if (!buffer) {
                return sock.sendMessage(jid, {
                    text: "❌ No pude descargar el archivo."
                });
            }

            // -----------------------------
            // 4) SUBIR
            // -----------------------------
            let url;

            if (/image/.test(mime)) {
                url = await uploadImage(buffer);
            } else {
                url = await uploadFile(buffer);
            }

            // -----------------------------
            // 5) RESPUESTA
            // -----------------------------
            await sock.sendMessage(jid, {
                text:
`✅ *Archivo subido correctamente*
📎 URL:
${url}`
            });

        } catch (e) {
            console.error("❌ ERROR TOUR:", e);
            await sock.sendMessage(m.key.remoteJid, {
                text: "❌ Hubo un error convirtiendo el archivo."
            });
        }
    }
};
