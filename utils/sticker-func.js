import fs from "fs";
import { exec } from "child_process";
import { createRequire } from "module";

// 🔥 ACTIVAR require en proyectos con "type": "module"
const require = createRequire(import.meta.url);

// 🔥 CARGAR node-webpmux (funciona 100%)
const webp = require("node-webpmux");

export async function makeSticker(buffer, packname = "ADRI-BOT", author = "Adri") {
    return new Promise((resolve, reject) => {
        try {

            const time = Date.now();
            const input = `/sdcard/Download/input_${time}.tmp`;
            const output = `/sdcard/Download/output_${time}.webp`;

            fs.writeFileSync(input, buffer);

            const cmd = `ffmpeg -i "${input}" -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -lossless 1 -qscale 1 -preset picture -an -vsync 0 "${output}"`;

            exec(cmd, async (err) => {
                fs.unlinkSync(input);

                if (err) return reject(err);
                if (!fs.existsSync(output)) return reject("No se generó el sticker.");

                let sticker = fs.readFileSync(output);
                fs.unlinkSync(output);

                // Crear metadata
                const img = new webp.Image();
                await img.load(sticker);

                img.exif = webp.Meta.create({
                    "Sticker Pack Name": packname,
                    "Sticker Pack Publisher": author
                });

                const final = await img.save(null);
                resolve(final);
            });

        } catch (err) {
            reject(err);
        }
    });
}
