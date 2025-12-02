import fs from "fs";
import { exec } from "child_process";

/**
 * Convierte cualquier buffer multimedia (imagen, video, gif)
 * en un sticker WebP listo para WhatsApp.
 */
export async function makeSticker(buffer) {
    return new Promise((resolve, reject) => {
        try {

            const input = `/sdcard/input_${Date.now()}.tmp`;
            const output = `/sdcard/output_${Date.now()}.webp`;

            // Guardamos el buffer recibido
            fs.writeFileSync(input, buffer);

            // ffmpeg convierte cualquier cosa a webp
            const cmd = `ffmpeg -i "${input}" -vcodec libwebp -vf scale=512:512:force_original_aspect_ratio=decrease,fps=15 -lossless 1 -qscale 1 -preset picture -an -vsync 0 "${output}"`;

            exec(cmd, (err) => {
                // borramos input TEMPORAL
                fs.unlinkSync(input);

                if (err) {
                    console.log("Error ffmpeg:", err);
                    return reject(err);
                }

                // leemos el sticker final
                const stickerBuffer = fs.readFileSync(output);

                // borramos output temporal
                fs.unlinkSync(output);

                resolve(stickerBuffer);
            });

        } catch (e) {
            reject(e);
        }
    });
}
