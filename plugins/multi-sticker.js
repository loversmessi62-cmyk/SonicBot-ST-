import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { downloadContentFromMessage } from "@whiskeysockets/baileys"

const __filename = new URL(import.meta.url).pathname
const __dirname = path.dirname(__filename)

export default {
    commands: ["s", "sticker", "stiker"],
    tags: ["sticker"],

    async run(sock, msg, args, ctx) {
        try {

            // === OBTENER EL MENSAJE CITADO ===
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
            const mediaMsg = quoted || msg.message?.imageMessage || msg.message?.videoMessage

            if (!mediaMsg)
                return sock.sendMessage(ctx.chat, { text: "📸 Envía o responde a una imagen/video." })

            // === DESCARGAR MEDIA ===
            const type = Object.keys(mediaMsg)[0]
            const stream = await downloadContentFromMessage(mediaMsg[type], type.replace("Message",""))

            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            // === RUTAS TEMPORALES ===
            const inputPath = path.join(__dirname, `input_${Date.now()}.jpg`)
            const outputPath = path.join(__dirname, `out_${Date.now()}.webp`)
            const exifPath = path.join(__dirname, `exif_${Date.now()}.exif`)
            const finalPath = path.join(__dirname, `sticker_${Date.now()}.webp`)

            fs.writeFileSync(inputPath, buffer)

            // === CREAR EXIF VALIDO ===
            const exifData = {
                "sticker-pack-id": "multi-sticker",
                "sticker-pack-name": "ADRI-BOT",
                "sticker-pack-publisher": "Adri",
                emojis: ["🔥"]
            }

            const exifJson = Buffer.from(JSON.stringify(exifData), "utf8")
            const exifHeader = Buffer.from("457869660000", "hex") // header válido

            fs.writeFileSync(exifPath, Buffer.concat([exifHeader, exifJson]))

            // === CONVERTIR A WEBP ===
            const cmd = `ffmpeg -i "${inputPath}" -vf scale=512:512:force_original_aspect_ratio=decrease,fps=15 -vcodec libwebp -lossless 1 -qscale 75 "${outputPath}" -y`

            await new Promise((resolve, reject) =>
                exec(cmd, (e) => e ? reject(e) : resolve())
            )

            // === AGREGAR EXIF ===
            const cmdExif = `webpmux -set exif "${exifPath}" "${outputPath}" -o "${finalPath}"`

            await new Promise((resolve, reject) =>
                exec(cmdExif, (e) => e ? reject(e) : resolve())
            )

            // === ENVIAR STICKER REAL ===
            await sock.sendMessage(ctx.chat, {
                sticker: { url: finalPath }
            })

            // === LIMPIAR TEMPORALES ===
            fs.unlinkSync(inputPath)
            fs.unlinkSync(outputPath)
            fs.unlinkSync(exifPath)
            fs.unlinkSync(finalPath)

        } catch (e) {
            console.log(e)
            return sock.sendMessage(ctx.chat, { text: "❌ Error generando sticker." })
        }
    }
}
