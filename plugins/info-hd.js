import Replicate from "replicate";
import axios from "axios";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

// Configura tu API KEY
const replicate = new Replicate({
    auth: "r8_PZQQOKMhEWjVt0dHQBhycl34cPak3WI4SrjAF"
});

const handler = async (msg, { conn }) => {
    try {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        // Verificar si respondió a una imagen
        if (!quoted?.imageMessage) {
            return await conn.sendMessage(msg.key.remoteJid, {
                text: "🚫 *Debes responder a una imagen con el comando* `.hd`"
            }, { quoted: msg });
        }

        // Descargar imagen
        const mediaStream = await downloadContentFromMessage(quoted.imageMessage, "image");
        let buffer = Buffer.alloc(0);
        for await (const chunk of mediaStream) buffer = Buffer.concat([buffer, chunk]);

        await conn.sendMessage(msg.key.remoteJid, {
            react: { text: "🔄", key: msg.key }
        });

        // Convertir imagen a base64
        const base64img = `data:image/jpeg;base64,${buffer.toString("base64")}`;

        // 🚀 Modelo CONFIRMADO Y FUNCIONAL
        const output = await replicate.run(
            "cjwbw/real-esrgan:9f28b`,",   // <- este modelo SÍ funciona hoy
            { input: { image: base64img } }
        );

        const hdUrl = output;
        if (!hdUrl) throw new Error("La API no devolvió imagen.");

        // Descargar imagen HD
        const hdBuffer = Buffer.from(
            (await axios.get(hdUrl, { responseType: "arraybuffer" })).data
        );

        // Enviar resultado
        await conn.sendMessage(msg.key.remoteJid, {
            image: hdBuffer,
            caption: "🖼️ *Imagen mejorada en HD*\n\n🤖 *Adribot*"
        }, { quoted: msg });

        await conn.sendMessage(msg.key.remoteJid, {
            react: { text: "✅", key: msg.key }
        });

    } catch (err) {
        console.error("ERROR HD:", err);
        await conn.sendMessage(msg.key.remoteJid, {
            text: "❌ *No se pudo mejorar la imagen.*"
        }, { quoted: msg });

        await conn.sendMessage(msg.key.remoteJid, {
            react: { text: "❌", key: msg.key }
        });
    }
};

handler.command = ["hd", "remini", "enhance"];
handler.tags = ["tools"];
handler.help = ["hd (responde a una imagen)"];

export default handler;
