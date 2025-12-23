import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import crypto from "crypto";

export async function writeExif(buffer, metadata = {}) {
  const tmp = crypto.randomBytes(6).toString("hex");

  const input = `/tmp/${tmp}.webp`;
  const output = `/tmp/${tmp}_exif.webp`;

  await fs.promises.writeFile(input, buffer);

  const exif = {
    "sticker-pack-name": metadata.packname || "",
    "sticker-pack-publisher": metadata.author || "",
    emojis: []
  };

  const exifAttr = Buffer.from(
    JSON.stringify(exif),
    "utf-8"
  );

  const exifHeader = Buffer.concat([
    Buffer.from([
      0x49, 0x49, 0x2A, 0x00,
      0x08, 0x00, 0x00, 0x00,
      0x01, 0x00,
      0x41, 0x57,
      0x07, 0x00,
      exifAttr.length & 0xff,
      (exifAttr.length >> 8) & 0xff,
      0x00, 0x00
    ]),
    exifAttr
  ]);

  await fs.promises.writeFile(`/tmp/${tmp}.exif`, exifHeader);

  await new Promise((resolve, reject) => {
    spawn("webpmux", [
      "-set", "exif", `/tmp/${tmp}.exif`,
      input,
      "-o", output
    ])
      .on("close", resolve)
      .on("error", reject);
  });

  const result = await fs.promises.readFile(output);

  // limpiar
  fs.unlinkSync(input);
  fs.unlinkSync(output);
  fs.unlinkSync(`/tmp/${tmp}.exif`);

  return result;
}