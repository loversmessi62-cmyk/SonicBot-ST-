
/*
- API PRIVADA Y APIKEY PRIVADA
- ESTE ARCHIVO PERTENECE A https://github.com/WillZek
- Soy Programador profesional
- contacto: wa.me/50557865603
- no robar, archivo privado para adrian
*/

import fetch from 'node-fetch'
import yts from 'yt-search'

const APIKEY = 'c50919b9828c357cd81e753f03d4c000'

let handler = async (m, { conn, usedPrefix, command, text }) => {

if (!text) {
  return m.reply(`🪐 Ingresa un texto o link de YouTube
Ejemplo: *${usedPrefix + command} autos edits*`)
}

let video
const isLink = text.includes('youtube.com') || text.includes('youtu.be')

try {
  if (isLink) {
    const id = text.split('v=')[1]?.split('&')[0] || text.split('/').pop()
    const res = await yts({ videoId: id })
    video = res
  } else {
    const res = await yts(text)
    video = res.videos[0]
  }

  if (!video) throw 'Video no encontrado'

  await m.reply(`🪐 Descargando audio de *${video.title}*...`)

  const apiURL =
    `https://optishield.uk/api/?type=youtubedl` +
    `&apikey=${APIKEY}` +
    `&url=${encodeURIComponent(video.url)}` +
    `&video=0`

  const apiRes = await fetch(apiURL)
  const json = await apiRes.json()

  if (!json?.result?.download)
    throw 'No se pudo obtener el audio'

  await conn.sendMessage(
    m.chat,
    {
      audio: { url: json.result.download },
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`
    },
    { quoted: m }
  )

} catch (e) {
  await m.reply(`🌱 Error\n${e}`)
}
}

handler.help = ['play']
handler.tags = ['descargas']
handler.command = ['play', 'musicdl']

export default handler