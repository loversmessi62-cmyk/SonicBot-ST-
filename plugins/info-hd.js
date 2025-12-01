import Replicate from "replicate";
import axios from "axios";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

const replicate = new Replicate({
    auth: "TU_API_KEY_AQUI"
});

export const run = async (sock, msg, args, ctx) => {
    try {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted?.imageMessage) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "🚫 *Debes responder a una imagen con el comando `.hd`*"
            }, { quoted: msg });
        }

        const mediaStream = await downloadContentFromMessage(quoted.imageMessage, "image");
        let buffer = Buffer.alloc(0);
        for await (const chunk of mediaStream) buffer = Buffer.concat([buffer, chunk]);

        await sock.sendMessage(msg.key.remoteJid, {
            react: { text: "🔄", key: msg.key }
        });

        const base64img = `data:image/jpeg;base64,${buffer.toString("base64")}`;

        // Modelo estable funcional en replicate
        const output = await replicate.run(
            "cjwbw/real-esrgan:9f28b14f6b12c1b70a29e", 
            { input: { image: base64img } }
        );

        const hdUrl = output;
        if (!hdUrl) throw new Error("No se generó la imagen HD");

        const hdBuffer = Buffer.from(
            (await axios.get(hdUrl, { responseType: "arraybuffer" })).data
        );

        await sock.sendMessage(msg.key.remoteJid, {
            image: hdBuffer,
            caption: "🖼️ *Imagen mejorada en HD*\n\n🤖 *Adribot*"
        }, { quoted: msg });

        await sock.sendMessage(msg.key.remoteJid, {
            react: { text: "✅", key: msg.key }
        });

    } catch (err) {
        console.error("ERROR HD:", err);
        await sock.sendMessage(msg.key.remoteJid, {
            text: "❌ *No se pudo procesar la imagen.*"
        }, { quoted: msg });

        await sock.sendMessage(msg.key.remoteJid, {
            react: { text: "❌", key: msg.key }
        });
    }
};

export const command = ["hd", "remini", "enhance"];
export const tags = ["tools"];
export const help = ["hd (responde a una imagen)"];
