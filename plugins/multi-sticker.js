import fs from "fs";
import { exec } from "child_process";

// ===========================
//     FUNCIÓN PARA STICKER
// ===========================
export async function sticker(buffer) {
    return new Promise((resolve, reject) => {
        try {
            const input = `/sdcard/input_${Date.now()}.jpg`;
            const output = `/sdcard/output_${Date.now()}.webp`;

            fs.writeFileSync(input, buffer);

            const cmd = `ffmpeg -i "${input}" -vf scale=512:512:force_original_aspect_ratio=decrease -vcodec libwebp -lossless 1 -qscale 1 -preset picture -an -vsync 0 "${output}"`;

            exec(cmd, (err) => {
                // Borrar input siempre
                if (fs.existsSync(input)) fs.unlinkSync(input);

                if (err) return reject(err);

                // Leer el sticker final
                const stickerBuffer = fs.readFileSync(output);

                // Borrar salida
                if (fs.existsSync(output)) fs.unlinkSync(output);

                resolve(stickerBuffer);
            });

        } catch (e) {
            reject(e);
        }
    });
}

// ===========================
//     COMANDO DEL PLUGIN
// ===========================
export default {
    commands: ["sticker", "s"],
    category: "sticker",
    admin: false,
    description: "Convierte una imagen en sticker.",

    async run(sock, msg, args, ctx) {
        const { jid, download } = ctx;

        // Descargar imagen/video
        let buffer;
        try {
            buffer = await download();
        } catch {
            return sock.sendMessage(
                jid,
                { text: "❌ Debes enviar o responder una *imagen*." },
                { quoted: msg }
            );
        }

        try {
            const stickerResult = await sticker(buffer);

            await sock.sendMessage(
                jid,
                { sticker: stickerResult },
                { quoted: msg }
            );

        } catch (err) {
            console.log("Error en sticker:", err);
            return sock.sendMessage(
                jid,
                { text: "⚠️ Error al convertir la imagen a sticker." },
                { quoted: msg }
            );
        }
    }
};
