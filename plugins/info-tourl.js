import axios from "axios";
import FormData from "form-data";

export default {
    commands: ["tourl", "upload"],
    admin: false,

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // 1️⃣ DESCARGAR MEDIA
        const media = await ctx.download();
        if (!media) {
            return sock.sendMessage(jid, {
                text: "❌ No encontré ningún archivo para subir.\nManda una imagen/video/audio/documento junto al comando."
            });
        }

        // 2️⃣ DETECTAR MIME
        const mime =
            msg.message?.imageMessage?.mimetype ||
            msg.message?.videoMessage?.mimetype ||
            msg.message?.audioMessage?.mimetype ||
            msg.message?.documentMessage?.mimetype ||
            "application/octet-stream";

        // Extensión por si Catbox la necesita
        const ext = mime.split("/")[1] || "bin";
        const filename = `file.${ext}`;

        // 3️⃣ SUBIR A CATBOX
        try {
            const form = new FormData();
            form.append("reqtype", "fileupload");
            form.append("fileToUpload", media, filename);

            const res = await axios.post(
                "https://catbox.moe/user/api.php",
                form,
                { headers: form.getHeaders() }
            );

            const url = res.data.trim();

            return sock.sendMessage(jid, {
                text: `✅ *Archivo subido con éxito*\n\n🔗 *URL Directa:*\n${url}`
            });

        } catch (err) {
            console.error("❌ Error al subir a Catbox:", err);

            return sock.sendMessage(jid, {
                text: "❌ Ocurrió un error al subir el archivo a Catbox.\nInténtalo de nuevo."
            });
        }
    }
};
