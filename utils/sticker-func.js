import fs from "fs";
import { exec } from "child_process";
import { createRequire } from "module";
const require = createRequire(import.meta.url); // <--- 🔥 ARREGLA require()

export async function makeSticker(buffer, packname = "ADRI-BOT", author = "Adri") {
    return new Promise((resolve, reject) => {
        try {
            const time = Date.now();
            const input = `/sdcard/Download/input_${time}.tmp`;
            const output = `/sdcard/Download/output_${time}.webp`;

            fs.writeFileSync(input, buffer);

            const cmd = `ffmpeg -i "${input}" -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -lossless 1 -qscale 1 -preset picture -an -vsync 0 "${output}"`;

            exec(cmd, (err) => {
                fs.unlinkSync(input);

                if (err) {
                    console.log("❌ Error FFmpeg:", err);
                    return reject(err);
                }

                if (!fs.existsSync(output)) {
                    return reject("No se generó el sticker.");
                }

                let sticker = fs.readFileSync(output);
                fs.unlinkSync(output);

                const webp = require("node-webpmux");
                const img = new webp.Image();

                img.load(sticker).then(() => {
                    img.exif = webp.Meta.create({
                        "Sticker Pack Name": packname,
                        "Sticker Pack Publisher": author
                    });

                    img.save(Buffer).then(finalSticker => {
                        resolve(finalSticker);
                    });
                }).catch(reject);
            });

        } catch (err) {
            reject(err);
        }
    });
}
