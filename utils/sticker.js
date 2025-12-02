import { writeExifImg } from "../utils/exif.js";
import webp from "node-webpmux";
import sharp from "sharp";
import fs from "fs";

export const sticker = async (buffer, pack = "AdriBot", author = "Adri") => {
    try {
        // Convertimos imagen → WebP FULL (sin recorte)
        let webpBuffer = await sharp(buffer)
            .resize(512, 512, { fit: "contain" })
            .webp({ lossless: true })
            .toBuffer();

        // Insertar EXIF (packname/author)
        const exifBuffer = await writeExifImg(webpBuffer, pack, author);
        return exifBuffer;

    } catch (e) {
        console.error("❌ Error al crear sticker:", e);
        return null;
    }
};
