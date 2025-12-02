import fs from "fs";
import { exec } from "child_process";
import path from "path";

export default {
    commands: ["sticker", "s"],
    category: "multi",
    admin: false,
    description: "Convierte una imagen en sticker.",

    async run(sock, msg, args, ctx) {
        const { jid, download } = ctx;

        // Descargar la imagen con tu handler
        let buffer;
        try {
            buffer = await download();
        } catch (e) {
            return sock.sendMessage(jid, { 
                text: "❌ Debes enviar o responder una *imagen*." 
            }, { quoted: msg });
        }

        // Guardar temporal
        const input = `/sdcard/input_${Date.now()}.jpg`;
        const output = `/sdcard/output_${Date.now()}.webp`;

        fs.writeFileSync(input, buffer);

        // Convertir a WebP con ffmpeg
        exec(`ffmpeg -i "${input}" -vf scale=512:512:force_original_aspect_ratio=decrease -vcodec libwebp -lossless 1 -qscale 1 -preset picture -an -vsync 0 "${output}"`,
            async (err) => {

                // Borrar input
                fs.unlinkSync(input);

                if (err) {
                    console.log(err);
                    return sock.sendMessage(jid, { 
                        text: "⚠️ Error al convertir la imagen a sticker." 
                    }, { quoted: msg });
                }

                // Enviar sticker correcto
                const stickerBuffer = fs.readFileSync(output);

                await sock.sendMessage(jid, { 
                    sticker: stickerBuffer 
                }, { quoted: msg });

                // Borrar archivo final
                fs.unlinkSync(output);
            }
        );
    }
};
