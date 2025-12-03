import { downloadContentFromMessage } from "@whiskeysockets/baileys";

const lastMedia = {}; // jid → { type, message }

export default {
    commands: ["ver"],
    category: "tools",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        let target = null;

        // Si responde a un mensaje
        if (quoted?.quotedMessage) {
            target = quoted.quotedMessage;
        }

        // Si NO responde → usar ultimo guardado
        else if (lastMedia[jid]) {
            target = lastMedia[jid].message;
        }

        if (!target) {
            return sock.sendMessage(jid, { text: "⚠️ No hay imagen o video reciente ni respondiste a uno." });
        }

        const getBuffer = async (media, type) => {
            const stream = await downloadContentFromMessage(media, type);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            return buffer;
        };

        // Foto
        if (target.imageMessage) {
            const buffer = await getBuffer(target.imageMessage, "image");
            return sock.sendMessage(jid, { image: buffer });
        }

        // Video
        if (target.videoMessage) {
            const video = target.videoMessage;

            try {
                const buffer = await getBuffer(video, "video");
                return sock.sendMessage(jid, { video: buffer });
            } catch {
                return sock.sendMessage(jid, { text: "❌ No pude obtener el video. Puede ser view-once o reenviado sin media." });
            }
        }

        return sock.sendMessage(jid, { text: "❌ Ese mensaje no contiene imagen ni video." });
    },

    // --------------- FIX PARA CRASH remoteJid ---------------
    async onMessage(msg, sock) {
        if (!msg) return;
        if (!msg.key) return;

        const jid = msg.key.remoteJid;
        if (!jid) return;

        const m = msg.message;
        if (!m) return;

        if (m.imageMessage) {
            lastMedia[jid] = { type: "image", message: m };
        }

        if (m.videoMessage) {
            lastMedia[jid] = { type: "video", message: m };
        }
    }
};
