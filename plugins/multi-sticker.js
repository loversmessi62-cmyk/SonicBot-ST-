   import baileys from "@whiskeysockets/baileys";
   import sharp from "sharp";  // Asegúrate de que esté instalado
   import { spawn } from "child_process";
   import fs from "fs";
   import path from "path";

   export default {
       commands: ["s", "sticker"],

       async run(sock, msg, args, ctx) {
           const jid = msg.key.remoteJid;

           // Usar ctx.download() para obtener el buffer
           let buffer;
           try {
               buffer = await ctx.download();
           } catch (e) {
               console.log(e);
               return sock.sendMessage(jid, {
                   text: "❌ No pude descargar el archivo. Asegúrate de responder a una imagen o video."
               }, { quoted: msg });
           }

           // Detectar si es video
           const isVideo = ctx.msg.message?.videoMessage || ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
           let stickerBuffer;

           try {
               if (!isVideo) {
                   // Para imágenes: convertir a WebP sticker con sharp
                   stickerBuffer = await sharp(buffer)
                       .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })  // Fondo transparente
                       .webp({ quality: 80, lossless: false })  // WebP con compresión
                       .toBuffer();
               } else {
                   // Para videos: extraer frame y convertir
                   const tempVideoPath = path.join(process.cwd(), 'temp_video.mp4');
                   const tempFramePath = path.join(process.cwd(), 'temp_frame.png');

                   fs.writeFileSync(tempVideoPath, buffer);

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

                   stickerBuffer = await sharp(tempFramePath)
                       .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                       .webp({ quality: 80, lossless: false })
                       .toBuffer();

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
   
