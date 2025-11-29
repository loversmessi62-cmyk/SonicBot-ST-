import uploadFile from "../lib/uploadFile.js";
import uploadImage from "../lib/uploadImage.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
    name: "tourl",
    alias: ["tourl"],
    desc: "Convierte imagen/video en URL",
    run: async (conn, m, args) => {
        try {
            let q = m.quoted ? m.quoted : m;
            let mime = q.mimetype || (q.msg && q.msg.mimetype) || "";

            if (!mime) return m.reply("⚠️ *Responde a una imagen, video o sticker.*");

            // DESCARGAR BUFFER MANUALMENTE (compatibilidad total)
            let type = mime.split("/")[0];

            let stream = await downloadContentFromMessage(q, type);
            let buffer = Buffer.from([]);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            if (!buffer) return m.reply("❌ No pude descargar el archivo.");

            let url;

            if (/image/.test(mime)) {
                url = await uploadImage(buffer);
            } else {
                url = await uploadFile(buffer);
            }

            return m.reply(`✅ *Archivo subido:*\n${url}`);

        } catch (e) {
            console.error("ERROR TOUR:", e);
            return m.reply("❌ Ocurrió un error procesando el archivo.");
        }
    }
}
