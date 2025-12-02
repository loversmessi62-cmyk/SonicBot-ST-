// qc.js — Adri-BOT Optimizado
import axios from "axios";
import { sticker } from "../lib/sticker.js";

export default {
    commands: ["qc", "multiqc", "quote"],
    group: true,
    category: "stickers",

    async run(sock, msg, args, ctx) {
        try {
            const jid = ctx.jid;

            // ==========================
            // 1. OBTENER TEXTO
            // ==========================
            let texto =
                args.join(" ") ||
                msg.quoted?.text ||
                msg.quoted?.caption ||
                msg.quoted?.message?.conversation ||
                null;

            if (!texto) {
                return sock.sendMessage(
                    jid,
                    { text: "⚠️ Escribe un texto o responde un mensaje." },
                    { quoted: msg }
                );
            }

            // ==========================
            // 2. USUARIO OBJETIVO
            // ==========================
            const target = msg.quoted?.sender || msg.sender;

            // Foto de perfil
            let pp = await sock.profilePictureUrl(target, "image").catch(
                () => "https://telegra.ph/file/24fa902ead26340f3df2c.png"
            );

            // Nombre del usuario
            const name = await sock.getName(target);

            // ==========================
            // 3. CUERPO PARA EL SERVIDOR QC
            // ==========================
            const body = {
                type: "quote",
                format: "png",
                backgroundColor: "#00000000",
                width: 512,
                height: 512,
                scale: 3,
                messages: [
                    {
                        avatar: true,
                        from: {
                            id: 1,
                            name,
                            photo: { url: pp }
                        },
                        text: texto,
                        replyMessage: {}
                    }
                ]
            };

            // ==========================
            // 4. GENERAR IMAGEN QC
            // ==========================
            const res = await axios.post(
                "https://bot.lyo.su/quote/generate",
                body,
                { headers: { "Content-Type": "application/json" } }
            );

            const pngBuffer = Buffer.from(res.data.result.image, "base64");

            // ==========================
            // 5. PACKNAME / AUTHOR
            // ==========================
            let userData = global.db?.data?.users?.[msg.sender] || {};
            let pack1 = userData.text1 || global.packsticker || "Adri-BOT";
            let pack2 = userData.text2 || global.packsticker2 || "Sticker";

            // Convertir a sticker con tu script
            const webp = await sticker(pngBuffer, null, pack1, pack2);

            // ==========================
            // 6. ENVIAR STICKER
            // ==========================
            await sock.sendMessage(
                jid,
                { sticker: webp },
                { quoted: msg }
            );

        } catch (e) {
            console.error("QC ERROR:", e);
            return sock.sendMessage(
                ctx.jid,
                { text: "❌ Error generando el QC:\n" + e.message },
                { quoted: msg }
            );
        }
    }
};
