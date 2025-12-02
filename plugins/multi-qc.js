// multi-qc.js — Adri-BOT
import axios from "axios"
import { createSticker } from "./multi-sticker.js";

export default {
    commands: ["qc", "multiqc", "quote"],
    group: true,
    usage: ".qc <texto>",
    category: "stickers",

    async run(sock, msg, args, ctx) {
        try {
            const { sender, quoted, from } = msg
            let text

            // Obtener texto
            if (args.length > 0) {
                text = args.join(" ")
            } else if (quoted?.text) {
                text = quoted.text
            } else {
                return sock.sendMessage(from, { text: "⚠️ Ingresa un texto o responde un mensaje." }, { quoted: msg })
            }

            // Persona mencionada o el autor
            const target = quoted?.sender || sender

            // Foto y nombre
            const pp = await sock.profilePictureUrl(target).catch(_ => "https://telegra.ph/file/24fa902ead26340f3df2c.png")
            const name = await sock.getName(target)

            if (text.length > 30)
                return sock.sendMessage(from, { text: "⚠️ El texto debe tener máximo **30 caracteres**." }, { quoted: msg })

            // Cuerpo mandado al servidor QC
            const body = {
                type: "quote",
                format: "png",
                backgroundColor: "#000000",
                width: 512,
                height: 768,
                scale: 2,
                messages: [
                    {
                        entities: [],
                        avatar: true,
                        from: {
                            id: 1,
                            name: name,
                            photo: { url: pp }
                        },
                        text: text,
                        replyMessage: {}
                    }
                ]
            }

            // Petición al servidor QC
            const res = await axios.post(
                "https://bot.lyo.su/quote/generate",
                body,
                { headers: { "Content-Type": "application/json" } }
            )

            const img = Buffer.from(res.data.result.image, "base64")

            // Pack stickers
            let u = global.db.data.users[sender] || {}
            let pack1 = u.text1 || global.packsticker
            let pack2 = u.text2 || global.packsticker2

            const stick = await sticker(img, false, pack1, pack2)

            await sock.sendFile(from, stick, "qc.webp", "", msg)

        } catch (e) {
            console.error(e)
            return sock.sendMessage(ctx.id, { text: "❌ Error creando el QC\n\n" + e.message })
        }
    }
}
