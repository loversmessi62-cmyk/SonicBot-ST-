import axios from "axios";

export default {
    commands: ["s", "sticker", "stick"],
    category: "tools",

    async run(sock, msg, args, ctx) {
        const { jid, download, type } = ctx;

        try {
            const buffer = await download();
            if (!buffer) {
                return sock.sendMessage(jid, { 
                    text: "❌ Envía o responde una *imagen, video o gif* para crear sticker." 
                }, { quoted: msg });
            }

            // === Cargar archivo recibido ===
            const mime = type || "image";
            const form = new FormData();
            form.append("file", buffer, "media");

            // === API que convierte todo a sticker ===
            const api = "https://api.tiodev.my.id/api/sticker";  // FUNCIONA PERFECTO

            const { data } = await axios.post(api, form, {
                headers: form.getHeaders(),
                responseType: "arraybuffer"
            });

            await sock.sendMessage(
                jid,
                {
                    sticker: data,
                    packname: "ADRIBOT",
                    author: "Hecho por Adri"
                },
                { quoted: msg }
            );

        } catch (e) {
            console.error("Error multi-sticker:", e);
            await sock.sendMessage(jid, {
                text: "⚠️ Error creando el sticker."
            }, { quoted: msg });
        }
    }
};
