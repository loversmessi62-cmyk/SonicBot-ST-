import axios from "axios";
import FormData from "form-data";

export default {
    commands: ["tourl", "upload"],
    admin: false,

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // 1️⃣ DESCARGAR MEDIA CON TU NUEVO ctx.download()
        const media = await ctx.download();
        if (!media) {
            return sock.sendMessage(jid, { text: "❌ No hay media para convertir a URL." });
        }

        // 2️⃣ SUBIR A CATBOX
        try {
            const form = new FormData();
            form.append("reqtype", "fileupload");
            form.append("fileToUpload", media, "file.jpg");

            const res = await axios.post("https://catbox.moe/user/api.php", form, {
                headers: form.getHeaders()
            });

            const url = res.data;

            await sock.sendMessage(jid, {
                text: `✅ *Archivo subido con éxito*\n\n🔗 URL: ${url}`
            });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(jid, {
                text: "❌ Error subiendo archivo a Catbox."
            });
        }
    }
};
