import Replicate from "replicate";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
    commands: ["hd"],

    async run(sock, msg, args, ctx) {
        try {
            const replicate = new Replicate({
                auth: "r8_PZQQOKMhEWjVt0dHQBhycl34cPak3WI4SrjAF"
            });

            // DETECCIÓN UNIVERSAL DE IMAGEN
            let m = msg.message;
            let img;

            if (m?.imageMessage) {
                img = m.imageMessage;
            } else if (m?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
                img = m.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
            } else if (m?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2?.message?.imageMessage) {
                img = m.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage;
            }

            if (!img) {
                return sock.sendMessage(msg.key.remoteJid, {
                    text: "❌ *Debes responder a una imagen.*"
                });
            }

            // DESCARGA DE LA IMAGEN
            const stream = await downloadContentFromMessage(img, "image");
            let buffer = Buffer.from([]);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // EJECUCIÓN DEL MODELO REAL-ESRGAN
            const output = await replicate.run(
                "lucataco/real-esrgan:5x4xzn6r5fiw3jouh3t7xc7v6u",
                {
                    input: {
                        image: `data:image/png;base64,${buffer.toString("base64")}`
                    }
                }
            );

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: output },
                caption: "✔️ *Imagen mejorada en HD*"
            });

        } catch (error) {
            console.error("ERROR HD:", error);
            sock.sendMessage(msg.key.remoteJid, { text: "❌ Error procesando la imagen.\n" + error });
        }
    }
};
