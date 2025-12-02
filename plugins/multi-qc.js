import axios from "axios";
import { sticker } from "../lib/sticker.js";

export default {
    commands: ["qc", "quote"],
    category: "stickers",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Obtener texto
        let texto = args.join(" ").trim();
        if (!texto && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) {
            texto = msg.message.extendedTextMessage.contextInfo.quotedMessage.conversation;
        }
        if (!texto) return sock.sendMessage(jid, { text: "🚩 *Te faltó el texto!*" });

        if (texto.length > 30)
            return sock.sendMessage(jid, { text: "🚩 *Máximo 30 caracteres!*" });

        const who = ctx.sender;
        
        // Foto de perfil
        let pfp;
        try {
            pfp = await sock.profilePictureUrl(who, "image");
        } catch {
            pfp = "https://telegra.ph/file/24fa902ead26340f3df2c.png";
        }

        // Nombre
        const nombre = ctx.pushName || "Usuario";

        // Objeto de la API
        const obj = {
            type: "quote",
            format: "png",
            backgroundColor: "#000000",
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
                        photo: { url: pfp },
                    },
                    text: texto,
                    replyMessage: {}
                }
            ]
        };

        // Petición API
        const json = await axios.post("https://bot.lyo.su/quote/generate", obj, {
            headers: { "Content-Type": "application/json" }
        });

        const buffer = Buffer.from(json.data.result.image, "base64");

        // Crear sticker
        const stk = await sticker(buffer, false, "ADRI BOT", "Sticker");

        return sock.sendMessage(jid, { sticker: stk }, { quoted: msg });
    }
};
