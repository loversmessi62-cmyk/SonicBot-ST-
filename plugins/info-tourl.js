import uploadFile from "../lib/uploadFile.js";
import uploadImage from "../lib/uploadImage.js";

export default {
    name: "tourl",
    alias: ["tourl", "upload"],
    desc: "Convierte una imagen/video en URL",
    run: async (conn, m, args) => {
        try {
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || "";

            if (!mime) return m.reply("⚠️ *Responde a una imagen, video o sticker.*");

            let media = await conn.downloadMediaMessage(q);

            let url;
            if (/image/.test(mime)) {
                url = await uploadImage(media);
            } else {
                url = await uploadFile(media);
            }

            await m.reply(`✅ *Archivo subido correctamente*\n📎 URL: ${url}`);

        } catch (e) {
            console.error("ERROR TOUR:", e);
            m.reply("❌ Error, no pude subir el archivo.");
        }
    }
}
