import { sticker } from "../lib/sticker.js";

export default {
    commands: ["s", "sticker", "stick"],
    category: "tools",

    async run(sock, msg, args, ctx) {
        const { jid, download } = ctx;

        try {
            // Descargar archivo enviado o citado
            const buffer = await download();
            if (!buffer) {
                return sock.sendMessage(
                    jid,
                    { text: "❌ Envía o responde una *imagen, video o gif* para crear sticker." },
                    { quoted: msg }
                );
            }

            // Crear sticker usando tu librería profesional
            const webp = await sticker(
                buffer,
                null,
                "ADRIBOT",        // Packname
                "Hecho por Adri"  // Author
            );

            if (!webp) {
                return sock.sendMessage(
                    jid,
                    { text: "⚠️ No se pudo generar el sticker." },
                    { quoted: msg }
                );
            }

            // Enviar sticker
            await sock.sendMessage(
                jid,
                { sticker: webp },
                { quoted: msg }
            );

        } catch (e) {
            console.error("Error multi-sticker (local):", e);
            await sock.sendMessage(
                jid,
                { text: "⚠️ Error creando el sticker." },
                { quoted: msg }
            );
        }
    }
};
