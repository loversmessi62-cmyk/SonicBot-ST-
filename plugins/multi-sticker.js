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

                // ⬇️ Medidas optimizadas
                "-vf",
                "scale=512:512:force_original_aspect_ratio=decrease," +
                "pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",

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

        await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });

        fs.unlinkSync(input);
        fs.unlinkSync(output);
    }
};
