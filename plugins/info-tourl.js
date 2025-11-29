import axios from "axios";
import fs from "fs";

export default {
    commands: ["tourl", "upload"],
    admin: false,

    async run(sock, msg, args, ctx) {
        const quoted =
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: "📸 *Responde a una imagen/video/documento para subirlo y obtener URL.*"
            });
        }

        // Detectar tipo de archivo
        let type =
            Object.keys(quoted)[0]; // Ej: imageMessage, videoMessage, documentMessage

        // Obtener el stream del archivo
        const buffer = await sock.downloadMediaMessage({
            message: quoted
        });

        if (!buffer) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: "❌ *No pude descargar el archivo.*"
            });
        }

        // Enviar a file.io
        try {
            const form = new FormData();
            form.append("file", buffer, "file");

            const upload = await axios.post("https://file.io", form, {
                headers: form.getHeaders()
            });

            if (!upload.data.success) {
                throw new Error("Error subiendo archivo");
            }

            const url = upload.data.link;

            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ *Archivo subido correctamente*\n\n🔗 URL: ${url}`
            });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ *Hubo un error subiendo el archivo.*"
            });
        }
    }
};
