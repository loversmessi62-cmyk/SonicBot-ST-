export default {
    commands: ["s", "sticker"],

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // =====================================
        //   DETECTAR IMAGEN O VIDEO CORRECTO
        // =====================================
        const detected = (() => {

            const m = msg.message;

            // 1. Imagen/video enviado directo
            if (m.imageMessage) return ["image", m.imageMessage];
            if (m.videoMessage) return ["video", m.videoMessage];

            // 2. View Once V2
            const vo = m?.viewOnceMessageV2?.message || m?.viewOnceMessage?.message;
            if (vo?.imageMessage) return ["image", vo.imageMessage];
            if (vo?.videoMessage) return ["video", vo.videoMessage];

            // 3. Mensaje citado
            const quoted = m?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted?.imageMessage) return ["image", quoted.imageMessage];
            if (quoted?.videoMessage) return ["video", quoted.videoMessage];

            return null;
        })();

        // Si no detecta media → mensaje
        if (!detected) {
            return sock.sendMessage(jid, {
                text: "⚠️ *Responde a una imagen o video con .s*"
            }, { quoted: msg });
        }

        const [type, media] = detected;

        // =====================================
        //   DESCARGAR EL ARCHIVO
        // =====================================
        let buffer;
        try {
            buffer = await ctx.download();  // usa TU handler
        } catch (e) {
            return sock.sendMessage(jid, {
                text: "❌ No pude descargar el archivo."
            }, { quoted: msg });
        }

        // =====================================
        //   ENVIAR STICKER
        // =====================================
        try {
            await sock.sendMessage(jid, {
                sticker: buffer
            }, { quoted: msg });
        } catch (e) {
            console.error("Error enviando sticker:", e);
            return sock.sendMessage(jid, {
                text: "❌ Error creando el sticker."
            }, { quoted: msg });
        }
    }
};
