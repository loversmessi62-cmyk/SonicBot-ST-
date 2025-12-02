import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";

const TMP = join(process.cwd(), "tmp-stickers");

// Asegurar carpeta tmp-stickers
if (!existsSync(TMP)) {
  await mkdir(TMP, { recursive: true });
}

function runFFmpeg(inPath, outPath) {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-y",
      "-i", inPath,
      "-vcodec", "libwebp",
      "-lossless", "1",
      "-preset", "picture",
      "-qscale", "60",
      outPath
    ]);

    ff.on("exit", code => {
      if (code === 0) resolve();
      else reject(new Error("ffmpeg failed with code " + code));
    });
  });
}

function createExif(pack, author) {
  const json = {
    "sticker-pack-id": "ADRIBOT",
    "sticker-pack-name": pack,
    "sticker-pack-publisher": author
  };

  const exif = Buffer.concat([
    Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00]),
    Buffer.from(JSON.stringify(json))
  ]);

  return exif;
}

export async function sticker(buffer, options, pack = "Pack", author = "Bot") {
  try {
    const input = join(TMP, "in_" + Date.now() + ".png");
    const output = join(TMP, "out_" + Date.now() + ".webp");

    // Guardar imagen temporal
    await writeFile(input, buffer);

    // Convertir a WebP
    await runFFmpeg(input, output);

    // Leer WebP
    const webp = await readFile(output);

    // Crear EXIF
    const exif = createExif(pack, author);

    // Unir EXIF + WEBP
    const final = Buffer.concat([exif, webp]);

    // Borrar temporales
    await unlink(input).catch(() => {});
    await unlink(output).catch(() => {});

    return final;

  } catch (e) {
    console.error("Sticker ERROR:", e);
    return null;
  }
}
