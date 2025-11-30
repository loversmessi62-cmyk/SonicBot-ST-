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
                text: "❌ No hay ningún archivo para subir."
            });
        }

        // 2️⃣ DETECTAR MIME Y NOMBRE
        const mime = msg.message?.imageMessage?.mimetype ||
                     msg.message?.videoMessage?.mimetype ||
                     msg.message?.audioMessage?.mimetype ||
                     msg.message?.documentMessage?.mimetype ||
                     "application/octet-stream";

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

            const url = res.data;

            await sock.sendMessage(jid, {
                text: `✅ *Archivo subido correctamente*\n\n🔗 URL directa:\n${url}`
            });

        } catch (err) {
            console.error("Error Catbox:", err);
            await sock.sendMessage(jid, {
                text: "❌ Hubo un error al subir el archivo a Catbox."
            });
        }
    }
};
