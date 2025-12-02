// multi-qc.js — BASE ADRI-BOT COMPATIBLE
import axios from "axios";
import { sticker } from "../lib/sticker.js";

export default {
    commands: ["qc"],

    async run(sock, msg, args, ctx) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;

            const text = args.join(" ").trim();
            if (!text) {
                return sock.sendMessage(jid, { text: "⚠️ Escribe texto.\nEj: .qc Hola" });
            }

            // Nombre real del usuario según tu base
            const name = ctx.name || "Usuario";

            // Foto del usuario
            let pfp;
            try {
                pfp = await sock.profilePictureUrl(sender, "image");
            } catch {
                pfp = "https://telegra.ph/file/24fa902ead26340f3df2c.png";
            }

            // Generar QC
            const body = {
                type: "quote",
                format: "png",
                backgroundColor: "#000000",
                width: 512,
                height: 768,
                scale: 2,
                messages: [
                    {
                        avatar: true,
                        from: {
                            id: 1,
                            name: name,
                            photo: { url: pfp }
                        },
                        text: text,
                        replyMessage: {}
                    }
                ]
            };

            const res = await axios.post(
                "https://bot.lyo.su/quote/generate",
                body,
                { headers: { "Content-Type": "application/json" } }
            );

            const img = Buffer.from(res.data.result.image, "base64");

            // Datos del pack
            const userData = global.db?.data?.users?.[sender] || {};
            const pack = userData.text1 || "AdriPack";
            const author = userData.text2 || "AdriBot";

            // Convertir a sticker
            const final = await sticker(img, null, pack, author);

            // Enviar
            return await sock.sendMessage(jid, { sticker: final });

        } catch (err) {
            console.error("QC ERROR:", err);
            return sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Error creando el QC."
            });
        }
    }
};
