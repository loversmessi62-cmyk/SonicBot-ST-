import fetch from "node-fetch"
import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"

const BOT_NAME = "MiBot"
const R_CANAL = null

let handler = async (m, { conn }) => {
  try {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype

    if (!mime) {
      return conn.reply(
        m.chat,
        "❌ Responde a una imagen, video o archivo válido.",
        m,
        R_CANAL
      )
    }

    await m.react("⏳")

    const media = await q.download()
    if (!media) throw "No se pudo descargar el archivo"

    const url = await uploadCatbox(media)
    const size = formatBytes(media.length)

    const text = `
*乂 U P L O A D E R 乂*

🔗 *Enlace:* ${url}
📦 *Tamaño:* ${size}
🕒 *Expiración:* No expira

> ${BOT_NAME}
`.trim()

    await conn.sendMessage(
      m.chat,
      { text },
      { quoted: m }
    )

    await m.react("✅")
  } catch (err) {
    console.error(err)
    await m.react("❌")
    conn.reply(m.chat, "⚠️ Error al subir el archivo.", m)
  }
}

handler.help = ["tourl", "catbox"]
handler.tags = ["tools"]
handler.command = /^(tourl|catbox)$/i

export default handler

/* ================= FUNCIONES ================= */

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B"
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

async function uploadCatbox(buffer) {
  const type = await fileTypeFromBuffer(buffer)
  if (!type) throw "Tipo de archivo desconocido"

  const blob = new Blob([buffer], { type: type.mime })
  const form = new FormData()

  const name = crypto.randomBytes(6).toString("hex") + "." + type.ext

  form.append("reqtype", "fileupload")
  form.append("fileToUpload", blob, name)

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form,
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  })

  const text = await res.text()
  if (!text.startsWith("https://")) throw "Error en Catbox"

  return text.trim()
}