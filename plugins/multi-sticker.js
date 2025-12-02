import fs from "fs";
import { exec } from "child_process";

async function convertToSticker(buffer, type = "image") {
    return new Promise((resolve, reject) => {
        try {
            const id = Date.now();
            const input = `/sdcard/input_${id}`;
            const output = `/sdcard/output_${id}.webp`;

            // Guarda según tipo
            let ext = "jpg";
            if (type === "video" || type === "gif") ext = "mp4";
            else if (type === "audio") ext = "mp3";
            else if (type === "sticker") ext = "webp";

            fs.writeFileSync(`${input}.${ext}`, buffer);

            let ffmpegCmd = "";

            if (type === "image") {
                ffmpegCmd = `ffmpeg -i "${input}.${ext}" -vf scale=512:512:force_original_aspect_ratio=decrease -vcodec libwebp -lossless 1 -qscale 1 -preset picture -an -vsync 0 "${output}"`;
            } else if (type === "sticker") {
                ffmpegCmd = `ffmpeg -i "${input}.${ext}" -vcodec libwebp -lossless 1 "${output}"`;
            } else if (type === "video" || type === "gif") {
                ffmpegCmd = `ffmpeg -i "${input}.${ext}" -vcodec libwebp -filter:v fps=15 -lossless 0 -qscale 30 -preset default -loop 0 -an -vsync 0 "${output}"`;
            } else if (type === "audio") {
                ffmpegCmd = `ffmpeg -i "${input}.${ext}" -filter_complex showwavespic=s=512x512:colors=white -frames:v 1 "${output}"`;
            }

            exec(ffmpegCmd, err => {
                fs.unlinkSync(`${input}.${ext}`);

                if (err) return reject(err);

                const result = fs.readFileSync(output);
                fs.unlinkSync(output);

                resolve(result);
            });

        } catch (e) {
            reject(e);
        }
    });
}

export default {
    commands: ["s", "sticker", "stick"],
    category: "tools",
    admin: false,
    description: "Convierte cualquier archivo en sticker.",

    async run(sock, msg, args, ctx) {
        const { jid, download, type } = ctx;

        let buffer;
        try {
            buffer = await download();
        } catch {
            return sock.sendMessage(jid, {
                text: "❌ Debes enviar o responder *cualquier archivo* (imagen/video/audio/gif/sticker)."
            }, { quoted: msg });
        }

        let contentType = "image";

        if (type === "videoMessage") contentType = "video";
        else if (type === "audioMessage") contentType = "audio";
        else if (type === "stickerMessage") contentType = "sticker";
        else if (type === "imageMessage") contentType = "image";

        try {
            const stickerFile = await convertToSticker(buffer, contentType);

            await sock.sendMessage(
                jid,
                { sticker: stickerFile },
                { quoted: msg }
            );
        } catch (e) {
            return sock.sendMessage(jid, {
                text: "⚠️ Error al procesar el sticker."
            }, { quoted: msg });
        }
    }
};
