import axios from "axios";

export default {
    command: ["hd"],
    admin: false,

    run: async (sock, msg, args, ctx) => {
        try {
            // Descargar media
            const buffer = await ctx.download().catch(() => null);

            if (!buffer) {
                return sock.sendMessage(ctx.jid, {
                    text: "❌ *Debes enviar o responder una imagen.*"
                });
            }

            // Enviar mensaje de proceso
            await sock.sendMessage(ctx.jid, {
                text: "🔧 *Mejorando calidad de imagen...*"
            });

            // Enviar imagen a la API
            const apiKey = "r8_PZQQOKMhEWjVt0dHQBhycl34cPak3WI4SrjAF";

            const { data } = await axios.post(
                "https://api.itsrose.rest/deepai/torch-srgan",
                buffer,
                {
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "Authorization": `Bearer ${apiKey}`
                    },
                    responseType: "arraybuffer"
                }
            );

            // Responder con la imagen mejorada
            await sock.sendMessage(ctx.jid, {
                image: data,
                caption: "✨ *Imagen mejorada en HD*"
            });

        } catch (e) {
            console.error("Error HD:", e);
            return sock.sendMessage(ctx.jid, {
                text: "❌ *Error al procesar imagen. Intenta de nuevo más tarde.*"
            });
        }
    }
};
