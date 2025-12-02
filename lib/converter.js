// lib/converter.js
import { promises as fs } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

// Función base ffmpeg universal (imagen/video → lo que pidas)
function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      let tmp = join(global.__dirname(import.meta.url), '../tmp', Date.now() + '.' + ext);
      let out = tmp + '.' + ext2;

      await fs.mkdir(join(global.__dirname(import.meta.url), '../tmp'), { recursive: true });
      await fs.writeFile(tmp, buffer);

      spawn('ffmpeg', [
        '-y',
        '-i', tmp,
        ...args,
        out
      ])
        .on('error', reject)
        .on('close', async (code) => {
          try {
            await fs.unlink(tmp);
            if (code !== 0) return reject(code);

            resolve({
              buffer: await fs.readFile(out),
              filepath: out,
              async delete() {
                await fs.unlink(out);
              }
            });
          } catch (e) {
            reject(e);
          }
        });
    } catch (e) {
      reject(e);
    }
  });
}

// Convertir imagen a WEBP (stickers)
export function toSticker(buffer, ext = 'png') {
  return ffmpeg(
    buffer,
    [
      '-vcodec', 'libwebp',
      '-vf', "scale=512:512:force_original_aspect_ratio=decrease,fps=15",
      '-lossless', '1',
      '-preset', 'picture',
      '-qscale', '50',
    ],
    ext,
    'webp'
  );
}

// Convertir video/gif a sticker animado
export function toAnimatedSticker(buffer, ext = 'mp4') {
  return ffmpeg(
    buffer,
    [
      '-vcodec', 'libwebp',
      '-vf', "scale=512:512:force_original_aspect_ratio=decrease,fps=15",
      '-loop', '0',
      '-an',
      '-vsync', '0',
      '-preset', 'picture',
      '-qscale', '50',
    ],
    ext,
    'webp'
  );
}

// Conversión a PTT (nota de voz)
export function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on'
  ], ext, 'ogg');
}

// Audio general
export function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10'
  ], ext, 'opus');
}

// Vídeo normal
export function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-ab', '128k',
    '-ar', '44100',
    '-crf', '32',
    '-preset', 'slow'
  ], ext, 'mp4');
}
