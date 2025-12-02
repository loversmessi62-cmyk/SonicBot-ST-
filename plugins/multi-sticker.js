import { makeSticker } from "../utils/sticker-func.js";

export default {
    commands: ["s", "sticker", "stick"],
    category: "tools",

    async run(sock, msg, args, ctx) {
        const { jid, download } = ctx;

        try {
            const buffer = await download();
            if (!buffer) {
                return sock.sendMessage(jid, { 
                    text: "❌ Debes enviar o responder una *imagen / video / gif / sticker*." 
                }, { quoted: msg });
            }

            const sticker = await makeSticker(buffer);

            await sock.sendMessage(
                jid,
                { sticker },
                { quoted: msg }
            );

        } catch (e) {
            console.error("Error en multi-sticker:", e);
            await sock.sendMessage(jid, { 
                text: "⚠️ Error creando el sticker." 
            }, { quoted: msg });
        }
    }
};
