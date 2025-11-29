import fetch from "node-fetch"

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = q.mimetype || q.mediaType || ""

  if (!mime || !mime.startsWith("image"))
    return m.reply("📷 *Responde a una imagen para convertirla a URL.*")

  let media = await q.download()
  let apiKey = "6d3b9f27859e88c0c7f387672d2dd4c9"

  m.reply("⏳ Subiendo imagen a *imgbb*...")

  let form = new FormData()
  form.append("key", apiKey)
  form.append("image", media.toString("base64"))

  let res = await fetch(`https://api.imgbb.com/1/upload`, {
    method: "POST",
    body: form
  })

  let json = await res.json()

  if (!json.success) {
    return m.reply("❌ Error subiendo la imagen:\n" + JSON.stringify(json, null, 2))
  }

  let url = json.data.url

  m.reply(`✅ *URL Lista:*\n${url}`)
}

handler.help = ["tourl"]
handler.tags = ["tools"]
handler.command = ["tourl"]

export default handler
