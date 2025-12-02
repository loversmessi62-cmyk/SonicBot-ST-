import baileys from "@whiskeysockets/baileys";
const { toSticker } = baileys;  // Función del fork de GataNina-Li para convertir a sticker

export default {
    commands: ["s", "sticker"],

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Usar ctx.download() para obtener el buffer
        let buffer;
        try {
            buffer = await ctx.download();
        } catch (e) {
            console.log(e);
            return sock.sendMessage(jid, {
                text: "❌ No pude descargar el archivo. Asegúrate de responder a una imagen o video."
            }, { quoted: msg });
        }

        // Convertir a sticker usando toSticker del fork
        let stickerBuffer;
        try {
            stickerBuffer = await toSticker(buffer, {
                packname: "ADRIBOT",  // Nombre del paquete (opcional)
                author: "TuBot",      // Autor (opcional)
                type: "full"          // Tipo: "full" para sticker completo
            });
        } catch (e) {
            console.log(e);
            return sock.sendMessage(jid, {
                text: "❌ Error convirtiendo a sticker."
            }, { quoted: msg });
        }

        // Enviar el sticker
        try {
            await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });
        } catch (e) {
            console.log(e);
            return sock.sendMessage(jid, {
                text: "❌ Error enviando el sticker."
            }, { quoted: msg });
        }
    }
};
