import Replicate from "replicate";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
    commands: ["hd"],

    async run(sock, msg, args, ctx) {
        try {
            const replicate = new Replicate({
                auth: "r8_PZQQOKMhEWjVt0dHQBhycl34cPak3WI4SrjAF"
            });

            // DETECCIÓN DE IMAGEN O IMAGEN CITADA
            let m = msg.message;
            let img;

            if (m?.imageMessage) {
                img = m.imageMessage;
            } else if (m?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
                img = m.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
            } else if (
                m?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2?.message?.imageMessage
            ) {
                img = m.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage;
            }

            if (!img) {
                return sock.sendMessage(msg.key.remoteJid, {
                    text: "❌ Debes responder a una *imagen*."
                });
            }

            // DESCARGAR IMAGEN
            const stream = await downloadContentFromMessage(img, "image");
            let buffer = Buffer.from([]);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // --> MODELO HD QUE SÍ FUNCIONA EN 2025:
            const output = await replicate.run(
                "xinntao/real-esrgan",
                {
                    input: {
                        image: `data:image/png;base64,${buffer.toString("base64")}`,
                        scale: 4,
                        face_enhance: true
                    }
                }
            );

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: output },
                caption: "✔️ Imagen mejorada en HD"
            });

        } catch (error) {
            console.error("ERROR HD:", error);
            sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Error al procesar la imagen.\n" + error
            });
        }
    }
};
