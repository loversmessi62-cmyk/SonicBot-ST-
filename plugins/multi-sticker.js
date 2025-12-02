export default {
    commands: ["sticker", "s"],
    category: "multi",
    admin: false,
    description: "Convierte una imagen en sticker.",

    async run(sock, msg, args, ctx) {
        const { jid, download } = ctx;

        // ================================
        //   DETECTAR IMAGEN (QUOTE O DIRECTA)
        // ================================
        let buffer;

        try {
            buffer = await download(); // Usa tu función EXACTA del handler
        } catch (e) {
            return sock.sendMessage(
                jid,
                { text: "❌ Debes enviar o responder una *imagen*." },
                { quoted: msg }
            );
        }

        // Validar que realmente sea una imagen
        const mime = msg.message?.imageMessage?.mimetype ||
                     msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage?.mimetype;

        if (!mime || !mime.includes("image")) {
            return sock.sendMessage(
                jid,
                { text: "❌ El archivo no es una imagen válida para convertir a sticker." },
                { quoted: msg }
            );
        }

        // ================================
        //       ENVIAR STICKER
        // ================================
        try {
            await sock.sendMessage(
                jid,
                { sticker: buffer },
                { quoted: msg }
            );
        } catch (err) {
            console.log("Error al enviar sticker:", err);
            return sock.sendMessage(jid, {
                text: "⚠️ Hubo un error al generar el sticker."
            }, { quoted: msg });
        }
    }
};
