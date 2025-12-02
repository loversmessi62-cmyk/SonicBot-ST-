import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";

const TMP = join(process.cwd(), "tmp-stickers");

// Crear carpeta temporal si no existe
if (!existsSync(TMP)) {
  await mkdir(TMP, { recursive: true });
}

// Ejecutar FFmpeg
function runFFmpeg(inPath, outPath) {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-y",
      "-i", inPath,
      "-vf", "scale=512:512:force_original_aspect_ratio=increase,crop=512:512",
      "-vcodec", "libwebp",
      "-lossless", "1",
      "-preset", "picture",
      "-qscale", "60",
      "-an",
      outPath
    ]);

    ff.on("exit", code => {
      if (code === 0) resolve();
      else reject(new Error("ffmpeg failed with code " + code));
    });
  });
}

// Crear EXIF válido
function createExif(pack, author) {
  const json = {
    "sticker-pack-id": "ADRIBOT",
    "sticker-pack-name": pack,
    "sticker-pack-publisher": author
  };

  const len = Buffer.byteLength(JSON.stringify(json));

  const exif = Buffer.concat([
    Buffer.from([
      0x49, 0x49, 0x2A, 0x00,
      0x08, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x41, 0x57,
      0x07, 0x00
    ]),
    Buffer.from([len, 0x00, 0x00, 0x00]),
    Buffer.from(JSON.stringify(json)),
    Buffer.from([0x00, 0x00])
  ]);

  return exif;
}

// Función principal
export async function sticker(buffer, options, pack = "AdriBOT", author = "Stickers") {
  try {
    const input = join(TMP, "in_" + Date.now() + ".png");
    const output = join(TMP, "out_" + Date.now() + ".webp");
    const exifPath = join(TMP, "exif_" + Date.now() + ".exif");

    // Guardar imagen temporal
    await writeFile(input, buffer);

    // Convertir a WebP con FFmpeg
    await runFFmpeg(input, output);

    // Crear EXIF
    const exif = createExif(pack, author);
    await writeFile(exifPath, exif);

    // Inyectar EXIF dentro del webp
    const ff = spawn("webpmux", [
      "-set", "icc", exifPath,
      output,
      "-o", output
    ]);

    await new Promise((resolve, reject) => {
      ff.on("exit", code =>
        code === 0 ? resolve() : reject("webpmux failed")
      );
    });

    // Cargar sticker final
    const final = await readFile(output);

    // Limpiar
    unlink(input).catch(() => {});
    unlink(output).catch(() => {});
    unlink(exifPath).catch(() => {});

    return final;

  } catch (e) {
    console.error("Sticker ERROR:", e);
    return null;
  }
}
