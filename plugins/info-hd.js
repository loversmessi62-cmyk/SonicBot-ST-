import axios from "axios";

export default {
    commands: ["hd", "remini"],
    category: "tools",
    description: "Mejora la calidad de una imagen",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // Debe citar una imagen
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) {
            return sock.sendMessage(jid, { text: "📸 *Responde a una imagen para mejorarla.*" });
        }

        // Detectamos si es imagen o sticker
        const qType = Object.keys(quoted)[0];

        if (!["imageMessage", "stickerMessage"].includes(qType)) {
            return sock.sendMessage(jid, { text: "⚠️ *Error: Solo puedo mejorar imágenes o stickers.*" });
        }

        // Descargar buffer con tu ctx.download FIX
        let buffer;
        try {
            buffer = await ctx.download();
        } catch (e) {
            console.error("⛔ Error al descargar media:", e);
            return sock.sendMessage(jid, { text: "❌ No pude leer el archivo. Manda una imagen normal." });
        }

        if (!buffer) {
            return sock.sendMessage(jid, { text: "❌ *No pude obtener la imagen. Intenta de nuevo.*" });
        }

        await sock.sendMessage(jid, { text: "⏳ *Mejorando imagen, espera…*" });

        try {
            // Enviar a DeepAI
            const response = await axios({
                method: "post",
                url: "https://api.deepai.org/api/torch-srgan", 
                headers: {
                    "api-key": "f34fd260-0a46-4e06-be83-77c41d7d2e07"
                },
                data: {
                    image: buffer.toString("base64")
                }
            });

            const result = response.data?.output_url;

            if (!result) {
                return sock.sendMessage(jid, { text: "❌ DeepAI no devolvió ninguna imagen HD." });
            }

            // Enviar la imagen mejorada
            await sock.sendMessage(jid, {
                image: { url: result },
                caption: "✨ *Imagen mejorada con éxito*"
            });

        } catch (err) {
            console.error(err);
            return sock.sendMessage(jid, {
                text: "❌ Error procesando la imagen. DeepAI puede estar saturado."
            });
        }
    }
};
