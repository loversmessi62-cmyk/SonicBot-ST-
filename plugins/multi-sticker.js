export default {
    commands: ["s", "sticker"],
    category: "stickers",

    async run(sock, msg, args, ctx) {
        const { jid } = ctx;

        // Verifica que haya imagen
        if (!msg.message.imageMessage && !msg.message.videoMessage) {
            return sock.sendMessage(jid, {
                text: "⚠️ Envía o responde a una imagen/video con:\n.s"
            }, { quoted: msg });
        }

        try {
            // Descargar la imagen/video
            const buffer = await ctx.download();

            // Enviar como sticker nativo
            await sock.sendMessage(
                jid,
                { 
                    sticker: buffer, 
                    mimetype: "image/webp" 
                },
                { quoted: msg }
            );

        } catch (err) {
            console.log("Error sticker:", err);
            return sock.sendMessage(
                jid,
                { text: "❌ Error creando el sticker." },
                { quoted: msg }
            );
        }
    }
};
