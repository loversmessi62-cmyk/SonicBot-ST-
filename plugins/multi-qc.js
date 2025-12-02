import axios from "axios";
import { sticker } from "../lib/sticker.js";

export default {
    commands: ["qc"],
    category: "stickers",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Texto de QC
        let texto = args.join(" ").trim();
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!texto && quoted?.conversation) texto = quoted.conversation;
        if (!texto) return sock.sendMessage(jid, { text: "⚠️ Te faltó escribir algo." });

        if (texto.length > 80)
            return sock.sendMessage(jid, { text: "⚠️ Máximo 80 caracteres." });

        // Foto de perfil
        let pp;
        try {
            pp = await sock.profilePictureUrl(ctx.sender, "image");
        } catch {
            pp = "https://telegra.ph/file/24fa902ead26340f3df2c.png";
        }

        const nombre = (ctx.pushName || "Usuario").slice(0, 20);

        // Objeto QC
        const obj = {
            type: "quote",
            format: "png",
            backgroundColor: "#00000000",
            width: 512,
            height: 768,
            scale: 2,
            messages: [
                {
                    entities: [],
                    avatar: true,
                    from: {
                        id: 1,
                        name: nombre,
                        photo: { url: pp }
                    },
                    text: texto,
                    replyMessage: {}
                }
            ]
        };

        // API QC
        const json = await axios.post(
            "https://bot.lyo.su/quote/generate",
            obj,
            { headers: { "Content-Type": "application/json" } }
        );

        const bufferPNG = Buffer.from(json.data.result.image, "base64");

        // 🟩 AQUÍ VIENE LA MAGIA → sticker sin recorte
        const stickerFinal = await sticker(bufferPNG, {
            type: "full",
            packname: "AdriBot 5.0",
            author: "Adri"
        });

        return sock.sendMessage(jid, { sticker: stickerFinal }, { quoted: msg });
    }
};
