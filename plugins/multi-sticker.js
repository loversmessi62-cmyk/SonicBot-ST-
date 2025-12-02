import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export default {
    commands: ["s", "sticker"],

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Descargar archivo
        let buffer;
        try {
            buffer = await ctx.download();
        } catch {
            return sock.sendMessage(jid, {
                text: "❌ Responde a una imagen o video para hacer sticker."
            }, { quoted: msg });
        }

        // Paths temporales
        const input = path.join(process.cwd(), `input_${Date.now()}.jpg`);
        const output = path.join(process.cwd(), `sticker_${Date.now()}.webp`);
        fs.writeFileSync(input, buffer);

        // FFmpeg → convertir a WebP (como sticker)
        await new Promise((resolve, reject) => {
            const ff = spawn("ffmpeg", [
                "-i", input,
                "-vf", "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=0x00000000",
                "-vcodec", "libwebp",
                "-lossless", "0",
                "-qscale", "70",
                "-preset", "default",
                "-an",
                "-vsync", "0",
                output
            ]);

            ff.on("exit", code => {
                if (code === 0) resolve();
                else reject(new Error("FFmpeg error"));
            });
        });

        const stickerBuffer = fs.readFileSync(output);

        // Enviar sticker
        await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });

        // Borrar temporales
        fs.unlinkSync(input);
        fs.unlinkSync(output);
    }
};
