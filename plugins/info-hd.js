import Replicate from "replicate";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
    commands: ["hd"],
    description: "Mejora la calidad de una imagen",
    
    async run(sock, msg, args, ctx) {
        try {
            const replicate = new Replicate({
                auth: "r8_PZQQOKMhEWjVt0dHQBhycl34cPak3WI4SrjAF"
            });

            // 📌 DETECCIÓN UNIVERSAL DE IMÁGENES
            const m = msg.message;
            let img;

            if (m?.imageMessage) {
                img = m.imageMessage;
            } 
            else if (m?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
                img = m.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
            }
            else if (m?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2?.message?.imageMessage) {
                img = m.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage;
            }

            if (!img) {
                return sock.sendMessage(msg.key.remoteJid, { text: "❌ Debes responder a una imagen." });
            }

            // 📌 DESCARGA DE LA IMAGEN
            const stream = await downloadContentFromMessage(img, "image");
            let buffer = Buffer.from([]);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 📌 ENVÍO A REPLICATE
            const output = await replicate.run(
                "lucataco/real-esrgan:latest",
                {
                    input: {
                        image: `data:image/png;base64,${buffer.toString("base64")}`
                    }
                }
            );

            // 📌 ENVÍA LA IMAGEN MEJORADA
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: output },
                caption: "✔️ Imagen mejorada en HD"
            });

        } catch (e) {
            console.error("ERROR HD:", e);
            sock.sendMessage(msg.key.remoteJid, { text: "❌ Error al procesar la imagen." });
        }
    }
};
