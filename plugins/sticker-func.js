import fs from "fs";
import { exec } from "child_process";

export async function makeSticker(buffer) {
    return new Promise((resolve, reject) => {

        const input = `/sdcard/input_${Date.now()}.jpg`;
        const output = `/sdcard/output_${Date.now()}.webp`;

        fs.writeFileSync(input, buffer);

        exec(
            `ffmpeg -i "${input}" -vf scale=512:512:force_original_aspect_ratio=decrease -vcodec libwebp -lossless 1 -qscale 1 -preset picture -an -vsync 0 "${output}"`,
            (err) => {

                fs.unlinkSync(input);

                if (err) return reject(err);

                const stickerBuffer = fs.readFileSync(output);
                fs.unlinkSync(output);

                resolve(stickerBuffer);
            }
        );
    });
}
