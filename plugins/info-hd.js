import axios from "axios";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
    commands: ["hd", "enhance", "mejorar"],

    async run(sock, msg, args, ctx) {

        // Detectar imagen en mensaje normal o mensaje citado
        let img =
            msg.message?.imageMessage ||
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
            msg.message?.ephemeralMessage?.message?.imageMessage ||
            msg.message?.viewOnceMessage?.message?.imageMessage;

        if (!img) {
            return sock.sendMessage(ctx.jid, {
                text: "📸 *Envía o responde a una imagen para mejorarla en HD.*"
            });
        }

        try {

            // Descargar la imagen correctamente
            let buffer = Buffer.from([]);

            const stream = await downloadContentFromMessage(
                img,
                "image"
            );

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            await sock.sendMessage(ctx.jid, { text: "⏳ *Mejorando imagen, espera…*" });

            // API gratuita
            const { data } = await axios.post(
                "https://api.deepai.org/api/torch-srgan",
                { image: buffer.toString("base64") },
                {
                    headers: {
                        "api-key": "quickstart-QUdJIGlzIGNvbWluZy4uLi4K"
                    }
                }
            );

            // Descargar la imagen resultante
            const hd = await axios.get(data.output_url, { responseType: "arraybuffer" });

            await sock.sendMessage(ctx.jid, {
                image: Buffer.from(hd.data),
                caption: "✨ *Imagen mejorada en HD*"
            });

        } catch (e) {
            console.error("HD ERROR:", e);
            return sock.sendMessage(ctx.jid, {
                text: "❌ *No pude mejorar esta imagen.*\nIntenta con otra o vuelve a enviarla."
            });
        }
    }
};
