import fs from 'fs'
import { exec } from 'child_process'
import path from 'path'

const __filename = new URL(import.meta.url).pathname
const __dirname = path.dirname(__filename)

export default {
    commands: ["s", "sticker", "stiker"],
    tags: ["sticker"],

    async run(sock, msg, args, ctx) {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
            const media = quoted || msg.message?.imageMessage || msg.message?.videoMessage

            if (!media) return sock.sendMessage(ctx.chat, { text: "📸 Envía o responde a una imagen/video." })

            // Descargar media
            const buffer = await ctx.downloadMediaMessage(media)

            const tempInput = path.join(__dirname, `temp_${Date.now()}.jpg`)
            const tempOutput = path.join(__dirname, `sticker_${Date.now()}.webp`)
            const tempExif = path.join(__dirname, `exif_${Date.now()}.exif`)

            fs.writeFileSync(tempInput, buffer)

            // Crear EXIF correcto
            const exifJson = {
                "sticker-pack-id": "multi-sticker-pack",
                "sticker-pack-name": "ADRI-BOT",
                "sticker-pack-publisher": "Adri",
                "emojis": ["🔥"]
            }

            fs.writeFileSync(tempExif, Buffer.concat([
                Buffer.from("52 49 46 46", "hex"),
                Buffer.from(JSON.stringify(exifJson), "utf8")
            ]))

            // Convertir a webp con ffmpeg
            const cmd = `ffmpeg -i "${tempInput}" -vf scale=512:512:force_original_aspect_ratio=decrease,fps=15 -vcodec libwebp -preset picture -lossless 1 -compression_level 6 -qscale 75 "${tempOutput}" -y`

            await new Promise((resolve, reject) => {
                exec(cmd, (err) => err ? reject(err) : resolve())
            })

            // Insertar EXIF
            const finalSticker = path.join(__dirname, `final_${Date.now()}.webp`)
            await new Promise((resolve, reject) => {
                exec(`webpmux -set exif "${tempExif}" "${tempOutput}" -o "${finalSticker}"`, (err) => {
                    if (err) reject(err)
                    else resolve()
                })
            })

            // Enviar sticker real
            await sock.sendMessage(ctx.chat, {
                sticker: { url: finalSticker }
            })

            // Borrar temporales
            fs.unlinkSync(tempInput)
            fs.unlinkSync(tempOutput)
            fs.unlinkSync(tempExif)
            fs.unlinkSync(finalSticker)

        } catch (e) {
            console.log(e)
            return sock.sendMessage(ctx.chat, { text: "❌ Error creando sticker." })
        }
    }
}
