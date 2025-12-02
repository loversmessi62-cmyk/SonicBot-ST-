import baileys from "@whiskeysockets/baileys";
import jimp from "jimp";  // Alternativa a sharp (instala con npm install jimp)
import { spawn } from "child_process";  // Para FFmpeg
import fs from "fs";
import path from "path";

export default {
    commands: ["s", "sticker"],

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Usar ctx.download() de tu handler para obtener el buffer
        let buffer;
        try {
            buffer = await ctx.download();  // Descarga el media detectado por el handler
        } catch (e) {
            console.log(e);
            return sock.sendMessage(jid, {
                text: "❌ No pude descargar el archivo. Asegúrate de responder a una imagen o video."
            }, { quoted: msg });
        }

        // Detectar tipo de media (basado en el buffer y ctx)
        const isVideo = ctx.msg.message?.videoMessage || ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
        let stickerBuffer;

        try {
            if (!isVideo) {
                // Para imágenes: usar jimp para convertir a WebP sticker
                const image = await jimp.read(buffer);
                image.resize(512, 512);  // Tamaño máximo de WhatsApp
                image.background(0x00000000);  // Fondo transparente
                stickerBuffer = await image.getBufferAsync(jimp.MIME_PNG);  // O usa WebP si jimp lo soporta, pero PNG funciona como sticker
                // Nota: jimp no tiene WebP directo, pero PNG con transparencia se envía como sticker en Baileys
            } else {
                // Para videos: extraer primer frame con FFmpeg y convertir con jimp
                const tempVideoPath = path.join(process.cwd(), 'temp_video.mp4');
                const tempFramePath = path.join(process.cwd(), 'temp_frame.png');

                fs.writeFileSync(tempVideoPath, buffer);

                // Extraer frame con FFmpeg
                await new Promise((resolve, reject) => {
                    const ffmpegProcess = spawn('ffmpeg', [
                        '-i', tempVideoPath,
                        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=00000000',
                        '-frames:v', '1',
                        tempFramePath
                    ]);
                    ffmpegProcess.on('close', (code) => {
                        if (code === 0) resolve();
                        else reject(new Error('FFmpeg failed'));
                    });
                });

                // Convertir frame con jimp
                const image = await jimp.read(tempFramePath);
                image.resize(512, 512);
                image.background(0x00000000);
                stickerBuffer = await image.getBufferAsync(jimp.MIME_PNG);

                // Limpiar temporales
                fs.unlinkSync(tempVideoPath);
                fs.unlinkSync(tempFramePath);
            }
        } catch (e) {
            console.log(e);
            return sock.sendMessage(jid, {
                text: "❌ Error procesando el sticker."
            }, { quoted: msg });
        }

        // Enviar sticker
        try {
            await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });
        } catch (e) {
            console.log(e);
            return sock.sendMessage(jid, {
                text: "❌ Error enviando el sticker."
            }, { quoted: msg });
        }
    }
};
