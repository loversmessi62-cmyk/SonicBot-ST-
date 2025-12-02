import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export default {
    commands: ["s", "sticker"],

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        let buffer;
        try {
            buffer = await ctx.download();
        } catch {
            return sock.sendMessage(jid, {
                text: "❌ Responde a una imagen o video para hacer sticker."
            }, { quoted: msg });
        }

        const input = path.join(process.cwd(), `input_${Date.now()}.jpg`);
        const output = path.join(process.cwd(), `sticker_${Date.now()}.webp`);
        fs.writeFileSync(input, buffer);

        await new Promise((resolve, reject) => {
            const ff = spawn("ffmpeg", [
                "-i", input,

                // 🔥 AUTO-FIT — SIN RECORTES, SIN BORDES, MISMA FORMA
                "-vf",
                "scale=512:-1:force_original_aspect_ratio=decrease",

                "-vcodec", "libwebp",
                "-lossless", "0",
                "-quality", "80",
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

        await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });

        fs.unlinkSync(input);
        fs.unlinkSync(output);
    }
};
