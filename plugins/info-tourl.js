import uploadFile from "../lib/uploadFile.js";
import uploadImage from "../lib/uploadImage.js";

export default {
    name: "tourl",
    alias: ["tourl", "upload"],
    desc: "Convierte una imagen/video en URL",
    run: async (conn, m, args) => {
        try {

            // Obtener el mensaje original si está citado
            let q = m.quoted ? m.quoted : m;

            // Detectar mimetype
            let mime = (q.msg && q.msg.mimetype) ? q.msg.mimetype : q.mimetype || "";

            if (!mime) return m.reply("⚠️ *Responde a una imagen, video, audio o sticker.*");

            // Descargar el archivo correctamente (Baileys actual)
            const buffer = await conn.downloadMediaMessage(q);

            if (!buffer) return m.reply("❌ No pude descargar el archivo.");

            let url;

            // Subir según tipo
            if (/image/.test(mime)) {
                url = await uploadImage(buffer);
            } else {
                url = await uploadFile(buffer);
            }

            await m.reply(`✅ *Archivo subido correctamente*\n📎 URL:\n${url}`);

        } catch (e) {
            console.error("ERROR TOUR:", e);
            m.reply("❌ Error, no pude subir el archivo.");
        }
    }
}
