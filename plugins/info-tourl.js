import axios from "axios";

export default {
    commands: ["tourl"],
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            return sock.sendMessage(jid, { text: "📌 *Responde a una imagen / video / archivo para subirlo.*" });
        }

        // Obtener el mensaje citado en formato WAMessage
        const qMsg = ctx.quoted;

        if (!qMsg) {
            return sock.sendMessage(jid, { text: "❌ No pude leer el mensaje citado." });
        }

        // DESCARGAR BUFFER
        const buffer = await sock.downloadMediaMessage(qMsg);

        if (!buffer) {
            return sock.sendMessage(jid, { text: "❌ No pude descargar el archivo." });
        }

        // SUBIR A CATBOX
        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", new Blob([buffer]), "file");

        const { data } = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders()
        });

        if (!data || typeof data !== "string") {
            return sock.sendMessage(jid, { text: "❌ Error al subir a Catbox." });
        }

        // RESPUESTA
        await sock.sendMessage(jid, {
            text: `☁️ *Archivo Subido con Éxito*\n\n📎 *URL:* ${data}`
        });
    }
};
