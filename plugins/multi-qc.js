import axios from "axios";
import { sticker } from "./sticker.js"; // <-- AQUÍ EL CAMBIO REAL

export default {
    commands: ["qc"],
    group: true,

    async run(sock, msg, args, ctx) {

        let text = args.join(" ");
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!text && quoted?.conversation) text = quoted.conversation;
        if (!text) {
            await sock.sendMessage(ctx.jid, {
                text: "❗ Ingresa un texto o responde un mensaje."
            });
            return;
        }

        const target = msg.key.participant || msg.key.remoteJid;

        let pp;
        try {
            pp = await sock.profilePictureUrl(target, "image");
        } catch {
            pp = "https://telegra.ph/file/24fa902ead26340f3df2c.png";
        }

        let nombre;
        try {
            nombre = await sock.getName(target);
        } catch {
            nombre = "Usuario";
        }

        if (text.length > 30) {
            await sock.sendMessage(ctx.jid, {
                text: "✧ El texto no puede tener más de 30 caracteres."
            });
            return;
        }

        const obj = {
            type: "quote",
            format: "png",
            backgroundColor: "#000000",
            width: 512,
            height: 768,
            scale: 2,
            messages: [{
                entities: [],
                avatar: true,
                from: {
                    id: 1,
                    name: nombre,
                    photo: { url: pp }
                },
                text: text,
                replyMessage: {}
            }]
        };

        const api = await axios.post(
            "https://bot.lyo.su/quote/generate",
            obj,
            { headers: { "Content-Type": "application/json" } }
        );

        const buffer = Buffer.from(api.data.result.image, "base64");

        // 👑 LO CONVERTIMOS A STICKER
        const pack1 = "ADRI-BOT";
        const pack2 = "QC Quotes";

        const st = await sticker(buffer, false, pack1, pack2);

        await sock.sendMessage(ctx.jid, {
            sticker: st
        }, { quoted: msg });
    }
};
