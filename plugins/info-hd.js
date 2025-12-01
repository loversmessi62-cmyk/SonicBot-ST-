const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const Replicate = require('replicate');

const replicate = new Replicate({
    auth: "r8_PZQQOKMhEWjVt0dHQBhycl34cPak3WI4SrjAF"
});

const handler = async (msg, { conn }) => {
    try {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted?.imageMessage) {
            return await conn.sendMessage(msg.key.remoteJid, {
                text: "🚫 *Responde a una imagen con el comando* `.hd`",
            }, { quoted: msg });
        }

        const mime = quoted.imageMessage.mimetype || "";
        if (!/image\/(jpe?g|png)/.test(mime)) {
            return await conn.sendMessage(msg.key.remoteJid, {
                text: "⚠️ *Solo se permiten imágenes JPG o PNG*",
            }, { quoted: msg });
        }

        // reacción
        await conn.sendMessage(msg.key.remoteJid, {
            react: { text: "🔄", key: msg.key }
        });

        // Descargar imagen
        const mediaStream = await downloadContentFromMessage(quoted.imageMessage, "image");
        let buffer = Buffer.alloc(0);

        for await (const chunk of mediaStream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        if (!buffer.length) {
            throw new Error("No se pudo descargar la imagen.");
        }

        // Guardar temp
        const tmpDir = path.join(__dirname, '../tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
        const imgPath = path.join(tmpDir, `ori_${Date.now()}.jpg`);
        fs.writeFileSync(imgPath, buffer);

        // Subir a base64 (Replicate requiere URL o base64)
        const base64img = `data:image/jpeg;base64,${buffer.toString('base64')}`;

        // Ejecutar modelo REAL y funcional
        const output = await replicate.run(
            "fofr/real-esrgan:latest",
            {
                input: {
                    image: base64img
                }
            }
        );

        // Output = array de URLs
        const hdUrl = output?.[0];
        if (!hdUrl) throw new Error("No se recibió imagen HD.");

        // Descargar la imagen HD desde la URL
        const axios = require("axios");
        const hdBuffer = Buffer.from(
            (await axios.get(hdUrl, { responseType: "arraybuffer" })).data
        );

        // Enviar imagen resultante
        await conn.sendMessage(msg.key.remoteJid, {
            image: hdBuffer,
            caption: "🖼️ *Imagen mejorada con HD*\n\n🤖 *Azura Ultra 2.0*"
        }, { quoted: msg });

        await conn.sendMessage(msg.key.remoteJid, {
            react: { text: "✅", key: msg.key }
        });

    } catch (e) {
        console.error("ERROR HD:", e);

        await conn.sendMessage(msg.key.remoteJid, {
            text: "❌ *Error procesando imagen. Intenta otra o vuelve más tarde.*"
        }, { quoted: msg });

        await conn.sendMessage(msg.key.remoteJid, {
            react: { text: "❌", key: msg.key }
        });
    }
};

handler.command = ['hd', 'enhance', 'remini'];
handler.tags = ['tools'];
handler.help = [
    'hd (responde a imagen) - Mejora calidad',
    'enhance (responde a imagen)',
    'remini (responde a imagen)'
];

module.exports = handler;
