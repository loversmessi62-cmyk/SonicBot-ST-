// ==============================================
// 🔥 MULTI-STICKER PROFESIONAL — ADRI-BOT
// ==============================================

import { writeFileSync, unlinkSync } from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";

export default {
    commands: ["s", "sticker", "stick"],
    category: "tools",

    async run(sock, msg, args, ctx) {
        const { jid, download } = ctx;

        try {
            // ============================
            //   DESCARGAR MEDIA
            // ============================
            const buffer = await download();
            if (!buffer) {
                return sock.sendMessage(jid, { 
                    text: "❌ Manda o responde una *imagen / video / gif / sticker*." 
                }, { quoted: msg });
            }

            // Rutas temporales
            const inputPath = path.join(process.cwd(), `temp_${Date.now()}`);
            const outputPath = path.join(process.cwd(), `temp_${Date.now()}.webp`);

            writeFileSync(inputPath, buffer);

            // ============================
            //       CONVERTIR A WEBP
            // ============================
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .inputOptions(["-y"])
                    .addOutputOptions([
                        "-vcodec", "libwebp",
                        "-vf", "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white,setsar=1",
                        "-lossless", "1",
                        "-compression_level", "6",
                        "-qscale", "50",
                        "-preset", "picture",
                        "-loop", "0",
                        "-an",
                        "-metadata", "title=Hecho por ADRI-BOT",
                        "-metadata", "artist=ADRI-BOT"
                    ])
                    .save(outputPath)
                    .on("end", resolve)
                    .on("error", reject);
            });

            // ============================
            //       ENVIAR STICKER
            // ============================
            const stickerBuffer = Buffer.from(await Bun.file(outputPath).arrayBuffer());

            await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });

            // LIMPIAR
            unlinkSync(inputPath);
            unlinkSync(outputPath);

        } catch (e) {
            console.error("Error en multi-sticker:", e);
            await sock.sendMessage(jid, { 
                text: "⚠️ Error creando el sticker." 
            }, { quoted: msg });
        }
    }
};
