import baileys from "@whiskeysockets/baileys";
const { downloadMediaMessage } = baileys;
import sharp from "sharp";  // Para procesar imágenes
import { spawn } from "child_process";  // Para ejecutar FFmpeg del sistema
import fs from "fs";
import path from "path";

export default {
    commands: ["s", "sticker"],

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Detectar media (imagen, video, quoted, o viewOnce)
        const m = msg.message;
        let target = null;

        if (m.imageMessage) target = msg;
        else if (m.videoMessage) target = msg;
        else if (m?.extendedTextMessage?.contextInfo?.quotedMessage) {
            target = {
                message: m.extendedTextMessage.contextInfo.quotedMessage
            };
        } else if (m?.viewOnceMessageV2?.message) {
            target = { message: m.viewOnceMessageV2.message };
        }

        if (!target) {
            return sock.sendMessage(jid, {
                text: "⚠️ *Responde a una imagen o video con .s*"
            }, { quoted: msg });
        }

        // Descargar el buffer del archivo
        let buffer;
        try {
            buffer = await downloadMediaMessage(
                target,
                "buffer",
                {},
                {
                    reuploadRequest: sock.updateMediaMessage
                }
            );
        } catch (e) {
            console.log(e);
            return sock.sendMessage(jid, {
                text: "❌ No pude descargar el archivo."
            }, { quoted: msg });
        }

        // Procesar el buffer para convertir a sticker WebP
        let stickerBuffer;
        try {
            if (target.message.imageMessage) {
                // Para imágenes: convertir a WebP con sharp
                stickerBuffer = await sharp(buffer)
                    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })  // Tamaño máximo, fondo transparente
                    .webp({ quality: 80 })  // Formato WebP
                    .toBuffer();
            } else if (target.message.videoMessage) {
                // Para videos: extraer primer frame con FFmpeg del sistema y convertir con sharp
                const tempVideoPath = path.join(process.cwd(), 'temp_video.mp4');
                const tempFramePath = path.join(process.cwd(), 'temp_frame.png');

                fs.writeFileSync(tempVideoPath, buffer);  // Guardar video temporal

                // Usar FFmpeg instalado en Termux para extraer el primer frame
                await new Promise((resolve, reject) => {
                    const ffmpegProcess = spawn('ffmpeg', [
                        '-i', tempVideoPath,
                        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=00000000',  // Escalar y pad con transparencia
                        '-frames:v', '1',
                        tempFramePath
                    ]);
                    ffmpegProcess.on('close', (code) => {
                        if (code === 0) resolve();
                        else reject(new Error('FFmpeg failed'));
                    });
                });

                // Convertir el frame a WebP con sharp
                stickerBuffer = await sharp(tempFramePath)
                    .webp({ quality: 80 })
                    .toBuffer();

                // Limpiar archivos temporales
                fs.unlinkSync(tempVideoPath);
                fs.unlinkSync(tempFramePath);
            }
        } catch (e) {
            console.log(e);
            return sock.sendMessage(jid, {
                text: "❌ Error procesando el sticker."
            }, { quoted: msg });
        }

        // Enviar el sticker procesado
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
