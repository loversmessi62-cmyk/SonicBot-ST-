import axios from "axios";

export default {
    commands: ["hd", "enhance", "mejorar"],

    async run(sock, msg, args, ctx) {

        // Verificar si hay imagen
        const img =
            msg.message?.imageMessage ||
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

        if (!img) {
            return sock.sendMessage(ctx.jid, {
                text: "📸 *Envía o responde a una imagen para mejorarla en HD.*"
            });
        }

        try {
            // Descargar imagen original
            const buffer = await ctx.download();

            await sock.sendMessage(ctx.jid, { text: "⏳ *Mejorando imagen, espera…*" });

            // API gratuita de upscale (muy estable)
            const { data } = await axios.post(
                "https://api.deepai.org/api/torch-srgan",
                {
                    image: buffer.toString("base64")
                },
                {
                    headers: {
                        "api-key": "quickstart-QUdJIGlzIGNvbWluZy4uLi4K"
                    }
                }
            );

            // Descargar la imagen mejorada
            const hdImage = await axios.get(data.output_url, { responseType: "arraybuffer" });

            // Enviar imagen resultante
            await sock.sendMessage(ctx.jid, {
                image: Buffer.from(hdImage.data),
                caption: "✨ *Imagen mejorada en HD*"
            });

        } catch (e) {
            console.error(e);
            return sock.sendMessage(ctx.jid, {
                text: "❌ *Error al mejorar la imagen.*\nIntenta con otra foto."
            });
        }
    }
};
