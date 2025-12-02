import webp from "node-webpmux";

export async function writeExifImg(buffer, packname, author) {
    const img = new webp.Image();
    await img.load(buffer);

    const json = {
        "sticker-pack-id": "AdriBot-Sticker",
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author
    };

    const exifAttr = Buffer.from(JSON.stringify(json), "utf-8");

    const exif = Buffer.concat([
        Buffer.from("EXIF\0\0"),
        exifAttr
    ]);

    img.exif = exif;
    return await img.save(null);
}
