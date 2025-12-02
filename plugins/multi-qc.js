import fs from "fs";
import path from "path";
import { sticker } from "../lib/sticker.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
    commands: ["qc", "multiqc", "multi-qc"],

    async run(sock, msg, args, ctx) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;

            // VERIFICAR SI ES RESPUESTA
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted)
                return sock.sendMessage(jid, { text: "❌ Responde a un mensaje para hacer QC." }, { quoted: msg });

            // DETECTAR TEXTO O IMAGEN
            let buffer;
            if (quoted.conversation) {
                // Si es texto
                buffer = Buffer.from(`
                ┌─── QC ───
                │ Usuario: @${sender.split("@")[0]}
                │ Mensaje: ${quoted.conversation}
                └──────────
                `);
            } else if (quoted.imageMessage) {
                // Si es imagen
                const stream = await downloadContentFromMessage(quoted.imageMessage, "image");
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                buffer = Buffer.concat(chunks);
            } else {
                return sock.sendMessage(jid, { text: "❌ Solo puedo hacer QC de imágenes o texto." }, { quoted: msg });
            }

            // CREAR STICKER CON EXIF
            const stc = await sticker(buffer, "QC AdriBot", "Adri");

            if (!stc)
                return sock.sendMessage(jid, { text: "❌ Error al generar QC." }, { quoted: msg });

            // ENVIAR
            await sock.sendMessage(jid, { sticker: stc }, { quoted: msg });

        } catch (e) {
            console.error("Error QC:", e);
            await sock.sendMessage(jid, { text: "❌ Error interno al generar el QC." }, { quoted: msg });
        }
    }
};
