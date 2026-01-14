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

export default {
  commands: ['play', 'musicdl'],
  category: 'descargas',
  admin: false,
  description: 'Descarga audio de YouTube',

  async run(sock, msg, args, ctx) {
    const jid = msg.key.remoteJid
    const text = args.join(' ')

    if (!text) {
      return sock.sendMessage(
        jid,
        {
          text: `🪐 Ingresa un texto o link de YouTube
Ejemplo: *play autos edits*`
        },
        { quoted: msg }
      )
    }

    let video
    const isLink = text.includes('youtube.com') || text.includes('youtu.be')

    try {
      if (isLink) {
        const id =
          text.split('v=')[1]?.split('&')[0] ||
          text.split('/').pop()

        const res = await yts({ videoId: id })
        video = res
      } else {
        const res = await yts(text)
        video = res.videos[0]
      }

      if (!video) throw 'Video no encontrado'

      await sock.sendMessage(
        jid,
        { text: `🪐 Descargando audio de *${video.title}*...` },
        { quoted: msg }
      )

      const apiURL =
        `https://optishield.uk/api/?type=youtubedl` +
        `&apikey=${APIKEY}` +
        `&url=${encodeURIComponent(video.url)}` +
        `&video=0`

      const apiRes = await fetch(apiURL)
      const json = await apiRes.json()

      if (!json?.result?.download)
        throw 'No se pudo obtener el audio'

      await sock.sendMessage(
        jid,
        {
          audio: { url: json.result.download },
          mimetype: 'audio/mpeg',
          fileName: `${video.title}.mp3`
        },
        { quoted: msg }
      )

    } catch (e) {
      await sock.sendMessage(
        jid,
        { text: `🌱 Error\n${e}` },
        { quoted: msg }
      )
    }
  }
}