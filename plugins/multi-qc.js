import axios from "axios";
import { writeExifImg } from "../lib/sticker.js";

export default {
    commands: ["qc", "quote"],
    category: "stickers",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        let texto = args.join(" ").trim();
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!texto && quoted?.conversation) texto = quoted.conversation;
        if (!texto) return sock.sendMessage(jid, { text: "🚩 *Te faltó el texto!*" });

        if (texto.length > 80)
            return sock.sendMessage(jid, { text: "🚩 Máximo 80 caracteres." });

        const who = ctx.sender;

        // FOTO DE PERFIL SEGURA
        let pfp;
        try {
            pfp = await sock.profilePictureUrl(who, "image");
        } catch {
            pfp = "https://telegra.ph/file/24fa902ead26340f3df2c.png";
        }

        const nombre = (ctx.pushName || "Usuario").slice(0, 24);

        // OBJETO DEL SERVIDOR DE QUOTES
        const obj = {
            type: "quote",
            format: "png",
            backgroundColor: "00000000",
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
                        photo: { url: pfp }
                    },
                    text: texto,
                    replyMessage: {}
                }
            ]
        };

        // GENERAR PNG BASE64
        const json = await axios.post("https://bot.lyo.su/quote/generate", obj, {
            headers: { "Content-Type": "application/json" }
        });

        const buffer = Buffer.from(json.data.result.image, "base64");

        // ⭐⭐⭐ STICKER SIN RECORTE ⭐⭐⭐
        const stickerFinal = await writeExifImg(buffer, {
            packname: "AdriBot 5.0",
            author: "Adri"
        });

        return sock.sendMessage(jid, { sticker: stickerFinal }, { quoted: msg });
    }
};
