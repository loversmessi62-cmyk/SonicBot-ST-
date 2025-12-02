// multi-qc.js — Adri-BOT
import axios from "axios";
import { sticker } from "../lib/sticker.js";

export default {
    commands: ["qc", "multiqc", "quote"],
    group: true,
    usage: ".qc <texto>",
    category: "stickers",

    async run(sock, msg, args, ctx) {
        try {
            const { jid } = ctx;

            let text;

            // Texto enviado
            if (args.length > 0) {
                text = args.join(" ");
            } else if (msg.quoted?.text) {
                text = msg.quoted.text;
            } else {
                return sock.sendMessage(
                    jid,
                    { text: "⚠️ Ingresa un texto o responde un mensaje para generar el QC." },
                    { quoted: msg }
                );
            }

            if (text.length > 30) {
                return sock.sendMessage(
                    jid,
                    { text: "⚠️ El texto debe tener *máximo 30 caracteres*." },
                    { quoted: msg }
                );
            }

            // Usuario objetivo
            const target = msg.quoted?.sender || msg.sender;

            // Obtener foto y nombre
            const pp = await sock.profilePictureUrl(target).catch(
                _ => "https://telegra.ph/file/24fa902ead26340f3df2c.png"
            );
            const name = await sock.getName(target);

            // Datos enviados al servidor QC
            const body = {
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
                            name: name,
                            photo: { url: pp }
                        },
                        text: text,
                        replyMessage: {}
                    }
                ]
            };

            // Hacer QC
            const res = await axios.post(
                "https://bot.lyo.su/quote/generate",
                body,
                { headers: { "Content-Type": "application/json" } }
            );

            // Convertir la imagen base64
            const img = Buffer.from(res.data.result.image, "base64");

            // Packname y Author dinámicos
            let userData = global.db.data.users[msg.sender] || {};
            let pack1 = userData.text1 || global.packsticker;
            let pack2 = userData.text2 || global.packsticker2;

            // Convertir a sticker usando tu sticker.js
            const result = await sticker(img, null, pack1, pack2);

            // Enviar sticker
            await sock.sendMessage(
                jid,
                { sticker: result },
                { quoted: msg }
            );

        } catch (e) {
            console.error("Error QC:", e);
            return sock.sendMessage(
                jid,
                { text: "❌ Error creando el QC:\n" + e.message },
                { quoted: msg }
            );
        }
    }
};
