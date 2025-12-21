import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";

const TMP = join(process.cwd(), "tmp-stickers");

// Crear carpeta temporal
if (!existsSync(TMP)) {
  await mkdir(TMP, { recursive: true });
}

// Ejecutar ffmpeg
function runFFmpeg(input, output) {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-y",
      "-i", input,
      "-vf",
      // 🔥 sticker WhatsApp real (sin bordes feos)
      "scale=512:512:force_original_aspect_ratio=decrease," +
      "pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0xFFFFFF",
      "-vcodec", "libwebp",
      "-lossless", "0",
      "-q:v", "80",
      "-preset", "default",
      "-an",
      "-vsync", "0",
      output
    ]);

    ff.on("close", code =>
      code === 0
        ? resolve()
        : reject(new Error("ffmpeg failed: " + code))
    );
  });
}

// FUNCIÓN PRINCIPAL
export async function sticker(buffer) {
  try {
    const input = join(TMP, `in_${Date.now()}.png`);
    const output = join(TMP, `out_${Date.now()}.webp`);

    await writeFile(input, buffer);
    await runFFmpeg(input, output);

    const final = await readFile(output);

    // limpiar
    unlink(input).catch(() => {});
    unlink(output).catch(() => {});

    return final;

  } catch (e) {
    console.error("❌ Sticker error:", e);
    return null;
  }
}
