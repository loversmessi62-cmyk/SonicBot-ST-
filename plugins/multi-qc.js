// qc.js — AdriBOT compatible sin canvas
import axios from "axios";
import { sticker } from "../lib/sticker.js";

export default {
    commands: ["qc"],

    async run(sock, msg, args, ctx) {
        try {
            const { jid, sender } = ctx;

            // Texto
            const text = args.join(" ").trim();
            if (!text) {
                return sock.sendMessage(jid, { text: "⚠️ Escribe texto.\nEj: .qc Hola" });
            }

            // Obtener nombre y foto reales del usuario
            const name = await sock.getName(sender) || "Usuario";

            const pfp = await sock.profilePictureUrl(sender)
                .catch(() => "https://telegra.ph/file/24fa902ead26340f3df2c.png");

            // Estructura QC
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

            // Generar imagen
            const res = await axios.post(
                "https://bot.lyo.su/quote/generate",
                body,
                { headers: { "Content-Type": "application/json" } }
            );

            const img = Buffer.from(res.data.result.image, "base64");

            // Pack dinámico
            let userData = global.db?.data?.users?.[sender] || {};
            const pack1 = userData.text1 || "AdriPack";
            const pack2 = userData.text2 || "AdriBot";

            // Convertir a sticker
            const result = await sticker(img, null, pack1, pack2);

            // Enviar sticker
            return await sock.sendMessage(jid, { sticker: result });

        } catch (e) {
            console.error("QC ERROR:", e);
            return sock.sendMessage(jid, {
                text: "❌ Error creando el QC.\n" + e.message
            });
        }
    }
};
