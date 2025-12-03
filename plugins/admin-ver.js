import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
    commands: ["ver"],
    category: "admin",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Revisa si es respuesta
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.quotedMessage) {
            return sock.sendMessage(jid, { text: "⚠️ Responde a una imagen o video." });
        }

        const qm = quoted.quotedMessage;

        // Función para descargar media
        const getBuffer = async (media) => {
            const type = Object.keys(media)[0];
            const stream = await downloadContentFromMessage(media[type], type.replace("Message", ""));
            let buffer = Buffer.from([]);

            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            return buffer;
        };

        // --------- IMAGEN ----------
        if (qm.imageMessage) {
            const buffer = await getBuffer(qm);

            return sock.sendMessage(jid, {
                image: buffer,
            });
        }

        // --------- VIDEO ----------
        if (qm.videoMessage) {
            const buffer = await getBuffer(qm);

            return sock.sendMessage(jid, {
                video: buffer,
            });
        }

        return sock.sendMessage(jid, {
            text: "❌ Solo funciona con imágenes o videos.",
        });
    },
};
