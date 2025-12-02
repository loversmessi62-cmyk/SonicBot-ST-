import fs from "fs";
import { exec } from "child_process";

export async function sticker(buffer) {
    return new Promise((resolve, reject) => {
        try {
            const input = `/sdcard/input_${Date.now()}.jpg`;
            const output = `/sdcard/output_${Date.now()}.webp`;

            fs.writeFileSync(input, buffer);

            exec(
                `ffmpeg -i "${input}" -vf scale=512:512:force_original_aspect_ratio=decrease -vcodec libwebp -lossless 1 -qscale 1 -preset picture -an -vsync 0 "${output}"`,
                (err) => {
                    fs.unlinkSync(input);

                    if (err) return reject(err);

                    const stickerBuffer = fs.readFileSync(output);
                    fs.unlinkSync(output);
                    resolve(stickerBuffer);
                }
            );
        } catch (e) {
            reject(e);
        }
    });
}

export default {
    commands: ["sticker", "s"],
    category: "admin",
    admin: false,
    description: "Convierte una imagen en sticker.",

    async run(sock, msg, args, ctx) {
        const { jid, download } = ctx;

        let buffer;
        try {
            buffer = await download();
        } catch {
            return sock.sendMessage(jid, {
                text: "❌ Debes enviar o responder una *imagen*."
            }, { quoted: msg });
        }

        try {
            const stickerResult = await sticker(buffer);

            await sock.sendMessage(
                jid,
                { sticker: stickerResult },
                { quoted: msg }
            );
        } catch {
            return sock.sendMessage(jid, { 
                text: "⚠️ Error al convertir la imagen a sticker."
            }, { quoted: msg });
        }
    }
};
