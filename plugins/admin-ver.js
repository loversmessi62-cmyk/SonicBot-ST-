import { downloadContentFromMessage } from "@whiskeysockets/baileys";

// Guardamos último media del chat
const lastMedia = {}; // jid → { type, message }

export default {
    commands: ["ver"],
    category: "admin",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Si responde a un mensaje → usar ese
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        let target = null;

        if (quoted?.quotedMessage) {
            target = quoted.quotedMessage;
        } 
        
        // Si NO responde → usar el último media guardado
        else if (lastMedia[jid]) {
            target = lastMedia[jid].message;
        }

        if (!target) {
            return sock.sendMessage(jid, { text: "⚠️ No hay ningún video o imagen reciente ni has respondido a uno." });
        }

        const getBuffer = async (media, type) => {
            const stream = await downloadContentFromMessage(media, type);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            return buffer;
        };

        // ============================
        //        FOTO
        // ============================
        if (target.imageMessage) {
            const buffer = await getBuffer(target.imageMessage, "image");
            return sock.sendMessage(jid, { image: buffer });
        }

        // ============================
        //        VIDEO
        // ============================
        if (target.videoMessage) {
            let video = target.videoMessage;

            // Si no tiene mediaKey (videos reenviados)
            if (!video.mediaKey && quoted?.quotedMessage?.videoMessage) {
                video = quoted.quotedMessage.videoMessage;
            }

            try {
                const buffer = await getBuffer(video, "video");
                return sock.sendMessage(jid, { video: buffer });
            } catch (e) {
                return sock.sendMessage(jid, { text: "❌ No pude procesar el video (puede ser view-once / reenviado sin media)." });
            }
        }

        return sock.sendMessage(jid, { text: "❌ Ese mensaje no contiene imagen ni video." });
    },

    // ==========================================================
    //   CAPTURAR CADA MENSAJE DEL CHAT Y GUARDAR SI ES MEDIA
    // ==========================================================
    async onMessage(msg, sock) {
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
