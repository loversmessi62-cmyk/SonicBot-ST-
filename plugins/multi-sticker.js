import fs from "fs";
import { exec } from "child_process";

// ======================================
//     FUNCIÓN PARA GENERAR CUALQUIER STICKER
// ======================================
export async function sticker(buffer, isVideo = false) {
    return new Promise((resolve, reject) => {
        try {
            const timestamp = Date.now();
            const input = `/sdcard/input_${timestamp}.${isVideo ? "mp4" : "jpg"}`;
            const output = `/sdcard/output_${timestamp}.webp`;

            fs.writeFileSync(input, buffer);

            // Comando para IMAGEN o WEBP
            const cmdImage = `ffmpeg -i "${input}" -vf scale=512:512:force_original_aspect_ratio=decrease -vcodec libwebp -lossless 1 -qscale 1 -preset picture -an -vsync 0 "${output}"`;

            // Comando para VIDEO/GIF (STICKER ANIMADO)
            const cmdVideo = `ffmpeg -i "${input}" -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -loop 0 -preset default -an -vsync 0 "${output}"`;

            const finalCmd = isVideo ? cmdVideo : cmdImage;

            exec(finalCmd, (err) => {
                // borrar input siempre
                if (fs.existsSync(input)) fs.unlinkSync(input);

                if (err) return reject(err);

                const stickerBuffer = fs.readFileSync(output);

                if (fs.existsSync(output)) fs.unlinkSync(output);

                resolve(stickerBuffer);
            });

        } catch (e) {
            reject(e);
        }
    });
}

// ======================================
//              COMANDO
// ======================================
export default {
    commands: ["sticker", "s"],
    category: "sticker",
    admin: false,
    description: "Convierte imagen/video/gif/webp a sticker.",

    async run(sock, msg, args, ctx) {
        const { jid, mime, download } = ctx;

        let buffer;
        try {
            buffer = await download();
        } catch {
            return sock.sendMessage(
                jid,
                { text: "❌ Debes enviar o responder *una imagen, video o gif*." },
                { quoted: msg }
            );
        }

        // Detectar si es video/gif
        const isVideo =
            mime?.includes("video") ||
            mime?.includes("gif") ||
            mime?.includes("webp") && !mime.includes("image");

        try {
            const stickerResult = await sticker(buffer, isVideo);

            await sock.sendMessage(
                jid,
                { sticker: stickerResult },
                { quoted: msg }
            );

        } catch (err) {
            console.log("Error en sticker:", err);
            return sock.sendMessage(
                jid,
                { text: "⚠️ Error al crear el sticker. Intenta con otro archivo." },
                { quoted: msg }
            );
        }
    }
};
